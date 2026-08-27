
document.addEventListener('DOMContentLoaded', () => {
  const tab = document.getElementById('toolsTab');
  const panel = document.getElementById('toolsPanel');
  const overlay = document.getElementById('overlay');
  const closeBtn = document.getElementById('closePanel');


  if (!tab || !overlay || !closeBtn) {
    console.warn('Script del panel: No se encontraron los elementos necesarios en el DOM.');
    return;
  }

  function openPanel() {
    document.body.classList.add('panel-open');
    tab.setAttribute('aria-expanded', 'true');
  }

  function closePanel() {
    document.body.classList.remove('panel-open');
    tab.setAttribute('aria-expanded', 'false');
  }

  function togglePanel() {
    document.body.classList.contains('panel-open') ? closePanel() : openPanel();
  }


  tab.addEventListener('click', togglePanel);
  closeBtn.addEventListener('click', closePanel);
  overlay.addEventListener('click', closePanel);
  
  document.addEventListener('keydown', (e) => {

    if (e.key === 'Escape' && document.body.classList.contains('panel-open')) {
      closePanel();
    }
  });
});
