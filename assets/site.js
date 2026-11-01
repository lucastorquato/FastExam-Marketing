const preview = document.querySelector('[data-preview]');
if (preview) {
  const buttons = [...document.querySelectorAll('[data-screen]')];
  const screenshot = preview.querySelector('img');
  const caption = document.querySelector('[data-preview-caption]');
  for (const button of buttons) {
    button.addEventListener('click', () => {
      for (const item of buttons) item.setAttribute('aria-pressed', String(item === button));
      screenshot.src = button.dataset.src;
      screenshot.alt = button.dataset.alt;
      caption.textContent = button.dataset.caption;
    });
  }
}

const menu = document.querySelector('[data-menu]');
const navigation = document.querySelector('[data-navigation]');
menu?.addEventListener('click', () => {
  const expanded = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(expanded));
  navigation.classList.toggle('is-open', expanded);
});
function closeMenu() {
  menu?.setAttribute('aria-expanded', 'false');
  navigation?.classList.remove('is-open');
}
navigation?.addEventListener('click', event => {
  if (event.target.closest('a')) closeMenu();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu?.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menu.focus();
  }
});
