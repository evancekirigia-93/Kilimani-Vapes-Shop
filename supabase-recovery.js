(()=>{'use strict';
const api='https://ymnzlsmttwcgitkvsmev.supabase.co/rest/v1/storefront_config?id=eq.kilimani&select=config';
const key='sb_publishable_5PNJHSXGSOQUat2EAOhvuA_2Lq0WQwR';
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const money=v=>'KSh '+Number(v||0).toLocaleString('en-KE');
const img=v=>typeof v==='string'&&/^https:\/\//.test(v)?v:'';
async function boot(){
try{
 const res=await fetch(api,{headers:{apikey:key},cache:'no-store'});
 if(!res.ok)throw Error('Supabase '+res.status);
 const rows=await res.json(),c=rows[0]?.config;
 if(!c?.products?.length)throw Error('Missing published products');
 window.KILIMANI_CONFIG=c;window.KILIMANI_SHARED=true;
 const names=(c.categories||[]).filter(n=>!c.categoryDetails?.some(d=>d.name===n&&d.visible===false));
 const products=c.products.filter(p=>p.published!==false&&names.includes(p.category));
 const banners=(c.banners||[]).filter(b=>b.published!==false).sort((a,b)=>(a.order||0)-(b.order||0));
 // Render from the database even when the legacy script fails to initialize.
 let category='All',sort='featured',slide=0;
 const cats=$('categories'),grid=$('productGrid'),select=$('categoryFilter'),nav=document.querySelector('header nav');
 function pick(n){category=n;drawProducts();document.querySelectorAll('[data-category]').forEach(el=>el.setAttribute('aria-current',String(el.dataset.category===n)));}
 const catLink=n=>'<a href="#catalogue" data-category="'+esc(n)+'">'+esc(n)+'</a>';
 if(nav)nav.innerHTML=['All',...names].map(catLink).join('')+'<a href="#contact">Our shop ↗</a>';
 if($('catalogueCategories'))$('catalogueCategories').innerHTML=['All',...names].map(catLink).join('');
 if(select)select.innerHTML=['All',...names].map(n=>'<option value="'+esc(n)+'">'+esc(n)+'</option>').join('');
 if(cats)cats.innerHTML=names.map(n=>{const d=c.categoryDetails?.find(x=>x.name===n);const first=products.find(p=>p.category===n);const url=img(d?.imageUrl||first?.imageUrl||first?.image);return '<a href="#catalogue" class="category" data-category="'+esc(n)+'">'+(url?'<img src="'+esc(url)+'" alt="" loading="lazy">':'')+'<b>'+esc(n)+'</b></a>';}).join('');
 function drawProducts(){
  if(!grid)return;
  let list=products.filter(p=>category==='All'||p.category===category);
  if(sort==='low')list.sort((a,b)=>a.price-b.price);
  if(sort==='high')list.sort((a,b)=>b.price-a.price);
  if(sort==='name')list.sort((a,b)=>a.name.localeCompare(b.name));
  grid.innerHTML=list.map(p=>{const url=img(p.imageUrl||p.image);return '<article class="kilimani-recovered-product"><div class="recovered-product-image">'+(url?'<img src="'+esc(url)+'" loading="lazy" alt="'+esc(p.name)+'">':'')+'</div><div class="recovered-product-details"><small>'+esc(p.category)+'</small><h3>'+esc(p.name)+'</h3><p>'+esc(p.size||p.bottleSize||'')+'</p><strong>'+money(p.price)+'</strong></div></article>';}).join('');
  if($('resultCount'))$('resultCount').textContent=list.length+' products';
  if(select)select.value=category;
 }
 drawProducts();
 document.addEventListener('click',e=>{const a=e.target.closest('[data-category]');if(a){e.preventDefault();pick(a.dataset.category);location.hash='catalogue';}});
 if(select)select.addEventListener('change',()=>pick(select.value));
 if($('sort'))$('sort').addEventListener('change',()=>{sort=$('sort').value;drawProducts();});
 if($('resetFilters'))$('resetFilters').addEventListener('click',()=>pick('All'));
 function showBanner(){
 const b=banners[slide];if(!b)return;const hero=document.querySelector('.hero');if(!hero)return;
 const url=img(b.imageUrl||b.image);hero.style.backgroundImage=url?'url("'+url+'")':'none';hero.classList.add('kilimani-recovered-hero');
 const copy=hero.querySelector('.hero-copy');if(copy){copy.style.display=url?'none':'';if(!url)copy.innerHTML='<h1>'+esc(b.title||'')+'</h1><p>'+esc(b.description||'')+'</p>';}
 const art=hero.querySelector('.hero-art');if(art)art.style.display='none';
 if($('bannerDots'))$('bannerDots').innerHTML=banners.map((_,i)=>'<button data-recovered-slide="'+i+'" aria-label="Banner '+(i+1)+'" aria-pressed="'+(i===slide)+'"></button>').join('');
 }
 showBanner();
 $('bannerPrevious')?.addEventListener('click',()=>{slide=(slide+banners.length-1)%banners.length;showBanner();});
 $('bannerNext')?.addEventListener('click',()=>{slide=(slide+1)%banners.length;showBanner();});
 $('bannerDots')?.addEventListener('click',e=>{const b=e.target.closest('[data-recovered-slide]');if(b){slide=Number(b.dataset.recoveredSlide);showBanner();}});
 document.documentElement.dataset.kilimaniSource='supabase';
 console.info('Kilimani restored from Supabase',products.length,names.length,banners.length);
}catch(err){console.error('Kilimani recovery failed:',err);}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();