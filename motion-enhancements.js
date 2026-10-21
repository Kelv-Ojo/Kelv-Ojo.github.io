// Content remains visible if Motion is unavailable.
if (window.Motion && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  Motion.animate('.hero-copy', { opacity: [0, 1] }, { duration: .45 });
  Motion.animate('.signature-art', { opacity: [0, 1] }, { duration: .65 });
  const caseDialog = document.querySelector('#case-dialog');
  new MutationObserver(() => {
    if (caseDialog.open) Motion.animate(caseDialog, { opacity: [0, 1] }, { duration: .16 });
  }).observe(caseDialog, { attributes: true, attributeFilter: ['open'] });
}
