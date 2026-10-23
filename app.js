const dialog=document.querySelector('#case-dialog'),content=document.querySelector('#case-content');let opener;

document.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>opener?.focus());dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{
 document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
 let count=0,moreCount=0;
 document.querySelectorAll('.project').forEach(card=>{
  card.hidden=button.dataset.filter!=='all'&&!card.dataset.tags.split(' ').includes(button.dataset.filter);
  if(!card.hidden){count++;if(card.closest('#more-projects'))moreCount++;}
 });
 const more=document.querySelector('#more-projects');more.hidden=moreCount===0;
 more.querySelector('summary').textContent=`More projects (${moreCount})`;
 more.open=button.dataset.filter!=='all'&&moreCount>0;
 document.querySelector('#filter-status').textContent=`Showing ${count} projects`;
}));

document.querySelectorAll('.chart').forEach(chart=>{
 const source=chart.querySelector('img');chart.tabIndex=0;chart.setAttribute('role','button');chart.setAttribute('aria-label','Enlarge preview: '+source.alt);
 function enlarge(){opener=chart;content.replaceChildren();const title=document.createElement('h2');title.id='case-title';title.textContent=source.alt;const image=source.cloneNode();image.loading='eager';content.append(title,image);dialog.classList.add('chart-dialog');dialog.showModal();}
 chart.addEventListener('click',enlarge);chart.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();enlarge();}});
});
dialog.addEventListener('close',()=>dialog.classList.remove('chart-dialog'));


const star=document.querySelector(".signature-art");
const reducedMotion=window.matchMedia("(prefers-reduced-motion: reduce)");
function resetStar(){star.style.setProperty("--star-x","0px");star.style.setProperty("--star-y","0px");star.style.setProperty("--star-tilt","0deg");}
star.addEventListener("click",()=>{
 const paused=star.getAttribute("aria-pressed")!=="true";
 star.setAttribute("aria-pressed",String(paused));
 star.setAttribute("aria-label",paused?"Resume decorative animations":"Pause decorative animations");
 star.classList.toggle("is-paused",paused);
 document.body.classList.toggle("art-paused",paused);
 resetStar();
});
star.addEventListener("pointermove",event=>{
 if(reducedMotion.matches||star.classList.contains("is-paused")||event.pointerType==="touch")return;
 const rect=star.getBoundingClientRect();
 const x=Math.max(-1,Math.min(1,(event.clientX-rect.left)/rect.width*2-1));
 const y=Math.max(-1,Math.min(1,(event.clientY-rect.top)/rect.height*2-1));
 star.style.setProperty("--star-x",x*12+"px");
 star.style.setProperty("--star-y",y*10+"px");
 star.style.setProperty("--star-tilt",x*5+"deg");
});
star.addEventListener("pointerleave",resetStar);

// Native modal behaviour keeps focus and background scrolling inside the drawer.
const menu=document.querySelector('#mobile-menu');
const menuToggle=document.querySelector('.menu-toggle');
const closeMenu=()=>menu.close();
menuToggle.addEventListener('click',()=>{
 menu.showModal();menuToggle.setAttribute('aria-expanded','true');
 document.body.classList.add('menu-open');
 if(!reducedMotion.matches)menu.animate([{transform:'translateX(100%)'},{transform:'translateX(0)'}],{duration:280,easing:'cubic-bezier(.32,.72,0,1)'});
});
menu.querySelector('.menu-close').addEventListener('click',closeMenu);
menu.querySelectorAll('a').forEach(link=>link.addEventListener('click',event=>{
 event.preventDefault();
 const target=document.querySelector(link.hash);
 closeMenu();
 history.replaceState(null,'',link.hash);
 requestAnimationFrame(()=>target.scrollIntoView({behavior:reducedMotion.matches?'instant':'smooth'}));
}));
menu.addEventListener('click',event=>{if(event.target===menu){const r=menu.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeMenu();}});
menu.addEventListener('close',()=>{menuToggle.setAttribute('aria-expanded','false');document.body.classList.remove('menu-open');menuToggle.focus({preventScroll:true});});
window.matchMedia('(min-width: 769px)').addEventListener('change',event=>{if(event.matches&&menu.open)closeMenu();});

// Animate on arrival without hiding content when JavaScript or observers are unavailable.
if('IntersectionObserver' in window){
 const arrival=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
   if(!entry.isIntersecting)return;
   if(!reducedMotion.matches)entry.target.animate(
    [{opacity:0,transform:'translateY(18px)'},{opacity:1,transform:'translateY(0)'}],
    {duration:560,easing:'cubic-bezier(.22,1,.36,1)'}
   );
   arrival.unobserve(entry.target);
  });
 },{threshold:.06});
 document.querySelectorAll('.hero-copy,.section-heading,.project,.study-item,.steps>div,.about-identity').forEach(element=>arrival.observe(element));
}

document.querySelectorAll('button.angel-art').forEach(art=>{
 art.addEventListener('click',()=>{
  const paused=art.getAttribute('aria-pressed')!=='true';
  art.classList.toggle('is-paused',paused);
  art.setAttribute('aria-pressed',String(paused));
  art.setAttribute('aria-label',paused?'Resume angel animation':'Pause angel animation');
 });
});
const finePointer=window.matchMedia('(hover:hover) and (pointer:fine) and (min-width:769px)');
document.querySelectorAll('.project .chart').forEach(chart=>{
 function reset(){chart.style.removeProperty('--chart-x');chart.style.removeProperty('--chart-y');}
 chart.addEventListener('pointermove',event=>{
  if(!finePointer.matches||reducedMotion.matches)return;
  const rect=chart.getBoundingClientRect();
  const x=Math.max(-1,Math.min(1,(event.clientX-rect.left)/rect.width*2-1));
  const y=Math.max(-1,Math.min(1,(event.clientY-rect.top)/rect.height*2-1));
  chart.style.setProperty('--chart-x',(-y*1.5)+'deg');
  chart.style.setProperty('--chart-y',(x*1.5)+'deg');
 });
 chart.addEventListener('pointerleave',reset);
 finePointer.addEventListener('change',reset);
 reducedMotion.addEventListener('change',reset);
});
