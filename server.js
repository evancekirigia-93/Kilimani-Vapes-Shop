'use strict';
// Optional dependency-free persistent server. Terminate HTTPS at your existing host.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const Model = require('./store-model.js');
const root = __dirname;
const port = Number(process.env.PORT || 3001);
const dataDir = process.env.KILIMANI_DATA_DIR || '/workspace/.kilimani-store';
fs.mkdirSync(dataDir, {recursive:true,mode:0o700});
const uploadsDir = path.join(dataDir,'uploads');
fs.mkdirSync(uploadsDir,{recursive:true,mode:0o700});
const configFile = path.join(dataDir,'store-config.json');
const ordersFile = path.join(dataDir,'orders.json');
const context = {window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'store-config.js'),'utf8'), context);
const defaults = Model.normalize(context.window.KILIMANI_CONFIG);
const password = process.env.KILIMANI_ADMIN_PASSWORD;
const passwordDigest = password ? crypto.createHash('sha256').update(password).digest() : null;
const sessions = new Map(), attempts = new Map();
const maxAge = 8*60*60*1000;
const secure = process.env.KILIMANI_SECURE_COOKIES === 'true';
const mime = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml'};
const files = new Map(['index.html','styles.css','script.js','store-config.js','store-model.js','draft-storage.js','admin.html','admin.css','admin.js'].map(file=>['/'+file,file]));
files.set('/','index.html');
function config() { return Model.normalize({...defaults,...(fs.existsSync(configFile)?JSON.parse(fs.readFileSync(configFile,'utf8')):{})}); }
function etag(c) {return '"'+crypto.createHash('sha256').update(JSON.stringify(c)).digest('hex')+'"';}
function atomicWrite(file,value) {const temp=file+'.'+crypto.randomBytes(8).toString('hex')+'.tmp';fs.writeFileSync(temp,JSON.stringify(value,null,2),{mode:0o600});fs.renameSync(temp,file);}
function send(res,status,data) {res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(data));}
function session(req) {
  const token=(req.headers.cookie||'').split(';').map(s=>s.trim()).find(s=>s.startsWith('kilimani_session='))?.slice(17);
  const value=token&&sessions.get(token);
  if(value&&value.expires>Date.now())return token;
  if(token)sessions.delete(token);
  return null;
}
async function body(req,limit=8*1024*1024) {let result='';for await(const chunk of req){result+=chunk;if(Buffer.byteLength(result)>limit)throw Error('Request too large');}return JSON.parse(result);}
function sameOrigin(req) {try {return !!req.headers.origin && new URL(req.headers.origin).host===req.headers.host;}catch{return false;}}
function serveImage(res,file) {res.writeHead(200,{'Content-Type':mime[path.extname(file)],'Cache-Control':'public, max-age=31536000, immutable','Content-Security-Policy':"default-src 'none'"});fs.createReadStream(file).on('error',()=>res.destroy()).pipe(res);}
const server = http.createServer(async(req,res)=>{
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('Referrer-Policy','same-origin');
  res.setHeader('X-Frame-Options','DENY');
  try {
    const url = new URL(req.url,'http://localhost');
    if(url.pathname==='/api/config'&&req.method==='GET'){const c=config();res.setHeader('ETag',etag(c));return send(res,200,c);}
    if(url.pathname==='/api/session'&&req.method==='GET')return send(res,200,{server:true,configured:!!passwordDigest,authenticated:!!session(req)});
    if(url.pathname.startsWith('/api/')&&['POST','PUT','PATCH','DELETE'].includes(req.method)&&!sameOrigin(req))return send(res,403,{error:'Origin check failed'});
    if(url.pathname==='/api/session'&&req.method==='POST'){
      if(!passwordDigest)return send(res,503,{error:'Admin access is disabled. Configure KILIMANI_ADMIN_PASSWORD securely on the server.'});
      const ip=req.socket.remoteAddress;
      let attempt=attempts.get(ip);
      if(!attempt||attempt.until<Date.now()){attempt={count:0,until:Date.now()+15*60*1000};attempts.set(ip,attempt);}
      if(attempt.count>=10)return send(res,429,{error:'Too many login attempts. Try again in 15 minutes.'});
      attempt.count++;
      const b=await body(req,10000);
      const provided=crypto.createHash('sha256').update(typeof b.password==='string'?b.password:'').digest();
      if(!crypto.timingSafeEqual(provided,passwordDigest))return send(res,401,{error:'Incorrect password'});
      attempts.delete(ip);
      for(const [token,s] of sessions)if(s.expires<Date.now())sessions.delete(token);
      const token=crypto.randomBytes(32).toString('hex');
      sessions.set(token,{expires:Date.now()+maxAge});
      res.setHeader('Set-Cookie',`kilimani_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${maxAge/1000}${secure?'; Secure':''}`);
      return send(res,200,{authenticated:true});
    }
    if(url.pathname==='/api/session'&&req.method==='DELETE'){
      const token=session(req);if(token)sessions.delete(token);
      res.setHeader('Set-Cookie','kilimani_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0');
      return send(res,200,{authenticated:false});
    }
    if(url.pathname==='/api/config'&&req.method==='PUT'){
      if(!session(req))return send(res,401,{error:'Sign in before saving shared changes'});
      const next=Model.normalize(await body(req));Model.validate(next);
      if(req.headers['if-match']&&req.headers['if-match']!==etag(config()))return send(res,409,{error:'Another admin changed the store. Export your edits, then reload before saving.'});
      atomicWrite(configFile,next);res.setHeader('ETag',etag(next));return send(res,200,{saved:true});
    }
    if(url.pathname==='/api/uploads'&&req.method==='POST'){
      if(!session(req))return send(res,401,{error:'Sign in before uploading images'});
      const b=await body(req,3*1024*1024);
      const match=typeof b.data==='string'&&b.data.match(/^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]+=*)$/);
      if(!match)return send(res,400,{error:'Only PNG, JPG and WebP images are allowed'});
      const bytes=Buffer.from(match[2],'base64');
      const type=match[1];
      const valid=type==='png'?bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])):type==='jpeg'?bytes.subarray(0,3).equals(Buffer.from([255,216,255])):bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP';
      if(!valid||bytes.length>2*1024*1024)return send(res,400,{error:'Invalid image or file larger than 2 MB'});
      const name=crypto.createHash('sha256').update(bytes).digest('hex')+'.'+(type==='jpeg'?'jpg':type);
      const file=path.join(uploadsDir,name);if(!fs.existsSync(file))fs.writeFileSync(file,bytes,{mode:0o600});
      return send(res,201,{url:'/uploads/'+name});
    }
    if(url.pathname==='/api/orders'&&req.method==='GET'){
      if(!session(req))return send(res,401,{error:'Sign in to view orders'});
      return send(res,200,fs.existsSync(ordersFile)?JSON.parse(fs.readFileSync(ordersFile,'utf8')):[]);
    }
    if(url.pathname.startsWith('/api/orders/')&&req.method==='PATCH'){
      if(!session(req))return send(res,401,{error:'Sign in to manage orders'});
      const b=await body(req,10000);if(!['pending','confirmed','dispatched','delivered','cancelled'].includes(b.status))return send(res,400,{error:'Invalid order status'});
      const orders=fs.existsSync(ordersFile)?JSON.parse(fs.readFileSync(ordersFile,'utf8')):[];
      const order=orders.find(o=>String(o.id)===decodeURIComponent(url.pathname.slice('/api/orders/'.length)));
      if(!order)return send(res,404,{error:'Order not found'});
      order.status=b.status;order.updatedAt=new Date().toISOString();atomicWrite(ordersFile,orders);return send(res,200,{saved:true});
    }
    if(url.pathname.startsWith('/api/'))return send(res,404,{error:'Unknown API route'});
    if(!['GET','HEAD'].includes(req.method))return send(res,405,{error:'Method not allowed'});
    if(/^\/uploads\/[a-f0-9]{64}\.(png|jpg|webp)$/.test(url.pathname)){
      const file=path.join(uploadsDir,path.basename(url.pathname));
      if(fs.existsSync(file)&&fs.realpathSync(file).startsWith(fs.realpathSync(uploadsDir)+path.sep)){if(req.method==='HEAD'){res.writeHead(200,{'Content-Type':mime[path.extname(file)]});return res.end();}return serveImage(res,file);}
    }
    let file=files.get(url.pathname);
    if(!file&&url.pathname.startsWith('/assets/')){
      const candidate=path.resolve(root,'.'+decodeURIComponent(url.pathname));
      if(candidate.startsWith(path.join(root,'assets')+path.sep)&&fs.existsSync(candidate)&&fs.statSync(candidate).isFile()&&fs.realpathSync(candidate).startsWith(path.join(root,'assets')+path.sep))file=path.relative(root,candidate);
    }
    if(!file||!fs.existsSync(path.join(root,file))||!mime[path.extname(file)])return send(res,404,{error:'Not found'});
    res.writeHead(200,{'Content-Type':mime[path.extname(file)],'Cache-Control':'no-cache'});
    if(req.method==='HEAD')return res.end();
    fs.createReadStream(path.join(root,file)).on('error',()=>res.destroy()).pipe(res);
  }catch(error){return send(res,400,{error:error.message==='Request too large'?error.message:'Invalid request or configuration: '+(error.message||'Unknown error')});}
});
server.listen(port,'0.0.0.0',()=>console.log(`Kilimani server listening on port ${server.address().port}; shared admin ${passwordDigest?'enabled':'disabled (password not configured)'}`));
