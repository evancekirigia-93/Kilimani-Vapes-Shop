(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.KilimaniStore = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const textDefaults = {phone:'',email:'',instagramUrl:'',facebookUrl:'',tiktokUrl:'',whatsappUrl:'',footerShopHeading:'Explore',footerHelpHeading:'Information',footerContactHeading:'Enjoy responsibly',copyrightText:'',aboutText:'',privacyPolicy:'',terms:'',journalHeading:'The Kilimani journal',articleHeading:'',journalIntroduction:'',articleSummary:'',articleBody:''};
  const deliveryDefaults = {heading:'Checkout preview',addressLabel:'Delivery address',latitude:null,longitude:null,phone:'',mpesa:false,cash:false,card:false,coupons:false,giftNotes:false,bands:[]};

  const uiDefaults = {
    pageTitle:'Kilimani Vapes Shop · A taste for the good life',metaDescription:'Discover wines, spirits and more at Kilimani Vapes Shop, Nairobi.',
    topNote:'For adults 18+ · Enjoy responsibly',searchPlaceholder:'Find your favourite bottle…',locationLabel:'Nairobi · Shop info',basketLabel:'Basket',shopAll:'Shop all',shopLink:'Our shop ↗',
    benefit1:'Nairobi based',benefit2:'Curated collection',benefit3:'Enjoy responsibly',benefit4:'Prices in KSh',shopInformation:'Shop information →',
    heroFoot:'WINES · SPIRITS · BEER',artCaption:'THE KILIMANI EDIT',artNote:'A pour for every occasion.',categoryDescription:'Choose a category. Find your next favourite.',browseCategories:'Browse the whole collection →',
    catalogueDescription:'A few favourites from the sample collection.',browseTitle:'Find your kind of good.',browseDescription:'Explore the collection by category, name or price.',browseButton:'Shop everything →',
    storyEyebrow:'THE KILIMANI WAY',storyButton:'Find your next favourite →',stampTop:'NAIROBI',stampBottom:'GOOD TASTE · GREAT COMPANY',detailsEyebrow:'COME FOR THE COLLECTION',detailsHeading:'Your neighbourhood. Your kind of good.',faqEyebrow:'BEFORE YOU BROWSE',faqHeading:'A few things to know.',
    partnerEyebrow:"LET'S GROW TOGETHER",partnerButton:'Explore partnership',footerCollection:'The collection ↗',footerShop:'Our shop ↗',footerAdmin:'Store editor ↗',responsibility:'Good times. Responsible choices.',responsibilityText:'For adults only. Alcohol is not for sale to persons under 18.',backToTop:'BACK TO TOP ↑',
    ageEyebrow:'KILIMANI VAPES SHOP · 18+',ageTitle:"Here's to good company.",ageDescription:'This website features alcohol. Please confirm you are 18 or older.',ageConfirm:'I am 18 or older →',ageDecline:'I am under 18',ageNote:'Age confirmation is not identity verification. Please drink responsibly.',
    bagHeading:'Your bag',emptyBag:'Your bag is waiting for something good.',addButton:'+ Add',subtotal:'Sample subtotal',checkoutButton:'Preview checkout →',checkoutName:'Full name',checkoutEmail:'Email',checkoutPhone:'Phone',checkoutReview:'Review demo order →'
  };
  const sectionDefaults={benefits:true,hero:true,categories:true,catalogue:true,rows:true,browse:true,story:true,partnership:true,journal:true};
  const faqDefaults=[{id:1,question:'Can I place an order now?',answer:'This is a catalogue and checkout preview. Orders will be enabled after inventory, delivery and payments are connected.',published:true,order:0},{id:2,question:'Are these prices final?',answer:'These are sample prices. Product availability and final prices require verification.',published:true,order:1},{id:3,question:'Where do you deliver?',answer:'Confirmed delivery areas and fees have not yet been configured.',published:true,order:2},{id:4,question:'How can I pay?',answer:'Payment methods will appear when a payment provider is connected. No payments are collected in this preview.',published:true,order:3}];
  function normalize(input) {
    const c = JSON.parse(JSON.stringify(input));
    Object.entries(textDefaults).forEach(([k,v]) => {if(c[k]===undefined)c[k]=v;});
    c.categoryDetails = c.categoryDetails || c.categories.map(name=>({name,imageUrl:'',visible:true}));
    c.products = c.products.map(p=>({published:true,stock:null,...p}));
    c.discounts = c.discounts || [];
    c.banners = c.banners || [
      {id:1,title:c.heroTitle,accent:c.heroAccent,eyebrow:c.heroEyebrow,description:c.heroDescription,imageUrl:'',link:'#catalogue',buttonText:'Shop the collection →',order:0,published:true},
      {id:2,title:c.bannerTitle,accent:'',eyebrow:'THE OCCASION EDIT',description:c.bannerDescription,imageUrl:'',link:'#catalogue',buttonText:'Explore the collection →',order:1,published:true},
      {id:3,title:c.occasionLine1,accent:c.occasionAccent,eyebrow:c.occasionEyebrow,description:c.occasionLine2,imageUrl:'',link:'#catalogue',buttonText:'Find your favourite →',order:2,published:true}
    ];
    c.rows = c.rows || [
      {id:1,title:'Discover wine',description:'From an easy evening to a special occasion.',category:c.categories.includes('Wine')?'Wine':c.categories[0],productIds:[],limit:8,order:0,published:true},
      {id:2,title:'Explore spirits',description:'Whisky, gin, vodka and more.',category:'',productIds:c.products.filter(p=>!['Wine','Beer'].includes(p.category)).map(p=>p.id),limit:8,order:1,published:true}
    ];
    c.delivery = {...deliveryDefaults,...c.delivery};
    c.ui = {...uiDefaults,...c.ui};
    c.ageImageUrl=c.ageImageUrl||'';c.ageBackground=c.ageBackground||'#ffffff';c.ageText=c.ageText||'#1c1d18';c.ageButton=c.ageButton||'#ef8c35';c.ageButtonText=c.ageButtonText||'#1c1d18';
    c.sections = {...sectionDefaults,...c.sections};
    c.categoryScroll={enabled:true,visible:3,seconds:3,...c.categoryScroll};
    c.faqs = c.faqs || faqDefaults;
    return c;
  }
  function imageUrl(value) {
    if(typeof value!=='string'||!value)return '';
    if(/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+=*$/.test(value))return value;
    if(/[\u0000-\u0020\\]/.test(value))return '';
    if(value.startsWith('//'))return '';
    if(/^[a-z][a-z0-9+.-]*:/i.test(value))return /^https?:\/\//i.test(value)?value:'';
    return value;
  }
  function href(value) {
    if(typeof value!=='string'||!value||/[\u0000-\u0020\\]/.test(value)||value.startsWith('//'))return '';
    if(/^[a-z][a-z0-9+.-]*:/i.test(value))return /^https?:\/\//i.test(value)?value:'';
    return value;
  }
  function validate(c) {
    const fail=message=>{throw Error(message);};
    const string=(s,name,max=20000)=>{if(typeof s!=='string'||s.length>max)fail('Invalid '+name);};
    const ids=(list,name,max)=>{if(!Array.isArray(list)||list.length>max)fail('Invalid '+name);const set=new Set();for(const item of list){if(!Number.isInteger(item.id)||item.id<1||set.has(item.id))fail('Duplicate or invalid '+name+' ID');set.add(item.id);}return set;};
    const image=(s,name)=>{string(s,name,4000000);if(s&&!imageUrl(s))fail('Invalid '+name+' URL');};
    if(!c||!Array.isArray(c.categories)||!c.categories.length||c.categories.length>100)fail('At least one category is required.');
    const names=new Set();for(const name of c.categories){string(name,'category',100);if(!name.trim()||names.has(name))fail('Category names must be unique.');names.add(name);}
    for(const key of ['brand','brandSubtitle','heroEyebrow','heroTitle','heroAccent','heroDescription','bannerTitle','bannerDescription','contactDescription','contactDetails',...Object.keys(textDefaults)])string(c[key],key);
    image(c.logoUrl,'logo');image(c.ageImageUrl,'popup image');
    for(const key of ['ink','cream','background','orange','gold','ageBackground','ageText','ageButton','ageButtonText'])if(!/^#[0-9a-f]{6}$/i.test(c[key]))fail('Invalid '+key+' colour');
    const productIds=ids(c.products,'product',1000);
    for(const p of c.products){string(p.name,'product name',200);if(!p.name.trim()||!names.has(p.category)||!Number.isFinite(p.price)||p.price<0||p.price>100000000||!/^#[0-9a-f]{6}$/i.test(p.color))fail('Invalid product: '+p.name);string(p.size,'size',100);string(p.description,'description');image(p.imageUrl,'product image');if(typeof p.published!=='boolean'||(p.stock!==null&&(!Number.isInteger(p.stock)||p.stock<0)))fail('Invalid product stock or visibility');}
    if(!Array.isArray(c.categoryDetails)||c.categoryDetails.length!==names.size)fail('Invalid category details');const detailNames=new Set();for(const d of c.categoryDetails){if(!names.has(d.name)||detailNames.has(d.name)||typeof d.visible!=='boolean')fail('Invalid category visibility');detailNames.add(d.name);image(d.imageUrl,'category image');}
    ids(c.banners,'banner',50);for(const b of c.banners){for(const key of ['title','accent','eyebrow','description','buttonText'])string(b[key],'banner '+key);if(!b.title.trim()||!Number.isFinite(b.order)||typeof b.published!=='boolean'||!href(b.link))fail('Invalid banner');image(b.imageUrl,'banner image');}
    ids(c.rows,'homepage row',100);for(const r of c.rows){string(r.title,'row title',200);string(r.description,'row description');if(!r.title.trim()||(r.category&&!names.has(r.category))||!Array.isArray(r.productIds)||r.productIds.some(id=>!productIds.has(id))||!Number.isInteger(r.limit)||r.limit<1||r.limit>100||!Number.isFinite(r.order)||typeof r.published!=='boolean')fail('Invalid homepage row');}
    ids(c.discounts,'discount',100);for(const d of c.discounts){string(d.name,'discount name',200);if(!d.name.trim()||!['percent','fixed'].includes(d.type)||!Number.isFinite(d.value)||d.value<=0||(d.type==='percent'&&d.value>100)||!Array.isArray(d.productIds)||!d.productIds.length||d.productIds.some(id=>!productIds.has(id))||typeof d.published!=='boolean')fail('Invalid discount');}
    const d=c.delivery;if(!d||!Array.isArray(d.bands))fail('Invalid delivery settings');for(const key of ['heading','addressLabel','phone'])string(d[key],'delivery '+key,200);for(const key of ['mpesa','cash','card','coupons','giftNotes'])if(typeof d[key]!=='boolean')fail('Invalid payment option');for(const [key,max] of [['latitude',90],['longitude',180]])if(d[key]!==null&&(!Number.isFinite(d[key])||Math.abs(d[key])>max))fail('Invalid dispatch '+key);if((d.latitude===null)!==(d.longitude===null))fail('Provide both dispatch coordinates.');
    ids(d.bands,'delivery band',100);let end=0;for(const b of [...d.bands].sort((a,b)=>a.fromKm-b.fromKm)){if(!Number.isFinite(b.fromKm)||!Number.isFinite(b.toKm)||!Number.isFinite(b.fee)||b.fromKm<end||b.fromKm<0||b.toKm<=b.fromKm||b.fee<0)fail('Delivery distance bands must not overlap.');end=b.toKm;}
    if(c.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email))fail('Invalid contact email');
    for(const k of ['instagramUrl','facebookUrl','tiktokUrl','whatsappUrl'])if(c[k]&&!/^https:\/\//i.test(c[k]))fail('Use HTTPS for social links.');
    for(const [key,value] of Object.entries(c.ui))string(value,'website text '+key);
    for(const value of Object.values(c.sections))if(typeof value!=='boolean')fail('Invalid section visibility');
    if(typeof c.categoryScroll.enabled!=='boolean'||![2,3].includes(c.categoryScroll.visible)||!Number.isInteger(c.categoryScroll.seconds)||c.categoryScroll.seconds<1||c.categoryScroll.seconds>60)fail('Invalid category scrolling settings');
    ids(c.faqs,'FAQ',100);for(const f of c.faqs){string(f.question,'FAQ question',500);string(f.answer,'FAQ answer');if(!f.question.trim()||typeof f.published!=='boolean'||!Number.isFinite(f.order))fail('Invalid FAQ');}
    return c;
  }
  function visibleCategories(c){return c.categories.filter(name=>c.categoryDetails.find(d=>d.name===name)?.visible!==false);}
  function price(c,p){let result=p.price;for(const d of c.discounts.filter(d=>d.published&&d.productIds.includes(p.id))){const discounted=d.type==='percent'?p.price*(1-d.value/100):p.price-d.value;result=Math.min(result,Math.max(0,Math.round(discounted*100)/100));}return result;}
  return {normalize,validate,imageUrl,href,visibleCategories,price};
});
