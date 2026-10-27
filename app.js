document.documentElement.classList.add('js');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
document.querySelectorAll('.signature-art, .angel-control').forEach(control => {
  const angel = control.classList.contains('angel-control');
  control.addEventListener('click', () => {
    const paused = control.getAttribute('aria-pressed') !== 'true';
    control.setAttribute('aria-pressed', String(paused));
    control.setAttribute('aria-label', `${paused ? 'Resume' : 'Pause'} ${angel ? 'angel animation' : 'decorative animations'}`);
    control.classList.toggle('is-paused', paused);
    control.querySelector('.art-caption').textContent = paused ? 'Resume animation' : 'Pause animation';
  });
});
const star = document.querySelector('.signature-art');
if (star) {
  const reset = () => { star.style.removeProperty('--star-x'); star.style.removeProperty('--star-y'); };
  star.addEventListener('pointermove', event => {
    if (reducedMotion.matches || star.classList.contains('is-paused') || event.pointerType === 'touch') return;
    const rect = star.getBoundingClientRect();
    star.style.setProperty('--star-x', `${(event.clientX - rect.left - rect.width / 2) / rect.width * 12}deg`);
    star.style.setProperty('--star-y', `${(event.clientY - rect.top - rect.height / 2) / rect.height * -12}deg`);
  });
  star.addEventListener('pointerleave', reset);
  reducedMotion.addEventListener('change', reset);
}
const finePointer = matchMedia('(hover:hover) and (pointer:fine)');
document.querySelectorAll('.project-preview').forEach(preview => {
  const reset = () => { preview.style.removeProperty('--tilt-x'); preview.style.removeProperty('--tilt-y'); };
  preview.addEventListener('pointermove', event => {
    if (reducedMotion.matches || !finePointer.matches) return;
    const rect = preview.getBoundingClientRect();
    preview.style.setProperty('--tilt-x', `${(event.clientY - rect.top - rect.height / 2) / rect.height * -3}deg`);
    preview.style.setProperty('--tilt-y', `${(event.clientX - rect.left - rect.width / 2) / rect.width * 3}deg`);
  });
  preview.addEventListener('pointerleave', reset);
  reducedMotion.addEventListener('change', reset);
});
const filters = document.querySelector('.filters');
const more = document.querySelector('#more-projects');
const cards = [...document.querySelectorAll('.project')];
// All projects remain readable when JavaScript is unavailable.
if (filters && more) {
  filters.hidden = false;
  filters.addEventListener('click', event => {
    const button = event.target.closest('button[data-filter]');
    if (!button) return;
    filters.querySelectorAll('button').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    let count = 0, supporting = 0;
    cards.forEach(card => {
      card.hidden = button.dataset.filter !== 'all' && !card.dataset.tags.split(' ').includes(button.dataset.filter);
      if (!card.hidden) { count++; if (more.contains(card)) supporting++; }
    });
    more.hidden = supporting === 0;
    more.querySelector('summary').textContent = `Further analysis (${supporting})`;
    more.open = button.dataset.filter !== 'all' && supporting > 0;
    document.querySelector('#filter-status').textContent = `Showing ${count} projects`;
  });
}
// Content stays visible without observers or when reduced motion is requested.
if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const arrivals = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.animate([{opacity: .4}, {opacity: 1}], {duration: 280, easing: 'ease-out'});
      arrivals.unobserve(entry.target);
    });
  }, {threshold: .08});
  document.querySelectorAll('.project, .skill-rows article, .steps article, .about-identity').forEach(element => arrivals.observe(element));
}
const menu = document.querySelector('#mobile-menu');
const toggle = document.querySelector('.menu-toggle');
if (menu && toggle) {
  toggle.addEventListener('click', () => { menu.showModal(); toggle.setAttribute('aria-expanded', 'true'); });
  menu.querySelector('.menu-close').addEventListener('click', () => menu.close());
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => menu.close()));
  menu.addEventListener('click', event => {
    if (event.target !== menu) return;
    const rect = menu.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) menu.close();
  });
  menu.addEventListener('close', () => { toggle.setAttribute('aria-expanded', 'false'); toggle.focus({preventScroll:true}); });
  matchMedia('(min-width: 561px)').addEventListener('change', event => { if (event.matches && menu.open) menu.close(); });
}
