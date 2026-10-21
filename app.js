const dialog=document.querySelector('#case-dialog'),content=document.querySelector('#case-content');let opener;

document.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>opener?.focus());dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));let count=0;document.querySelectorAll('.project').forEach(card=>{card.hidden=button.dataset.filter!=='all'&&!card.dataset.tags.split(' ').includes(button.dataset.filter);if(!card.hidden)count++});document.querySelector('#filter-status').textContent=`Showing ${count} projects`;}));

document.querySelectorAll('.chart').forEach(chart=>{
 const source=chart.querySelector('img');chart.tabIndex=0;chart.setAttribute('role','button');chart.setAttribute('aria-label','Enlarge preview: '+source.alt);
 function enlarge(){opener=chart;content.replaceChildren();const title=document.createElement('h2');title.id='case-title';title.textContent=source.alt;const image=source.cloneNode();image.loading='eager';content.append(title,image);dialog.classList.add('chart-dialog');dialog.showModal();}
 chart.addEventListener('click',enlarge);chart.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();enlarge();}});
});
dialog.addEventListener('close',()=>dialog.classList.remove('chart-dialog'));


const star=document.querySelector(".signature-art");
const starHint=star.querySelector(".motion-hint");
const reducedMotion=window.matchMedia("(prefers-reduced-motion: reduce)");
function resetStar(){star.style.setProperty("--star-x","0px");star.style.setProperty("--star-y","0px");star.style.setProperty("--star-tilt","0deg");}
star.addEventListener("click",()=>{
 const paused=star.getAttribute("aria-pressed")!=="true";
 star.setAttribute("aria-pressed",String(paused));
 star.setAttribute("aria-label",paused?"Resume star animation":"Pause star animation");
 star.classList.toggle("is-paused",paused);
 starHint.textContent=paused?"Paused · click or tap to resume":"Click or tap to pause";
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
