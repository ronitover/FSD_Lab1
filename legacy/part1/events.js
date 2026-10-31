(() => {
  const welcome = document.getElementById('welcome-toast');

  // load: greet the visitor once everything (images, scripts) has finished loading,
  // or remind them about a donation they started but never posted.
  window.addEventListener('load', () => {
    if (!welcome) return;
    let hasDraft = false;
    try {
      hasDraft = Boolean(localStorage.getItem('replate:donation-draft'));
    } catch {
      /* Storage blocked - fall back to the plain welcome. */
    }
    document.getElementById('welcome-toast-title').textContent = hasDraft ? 'Welcome back!' : 'Welcome to RePlate';
    document.getElementById('welcome-toast-body').textContent = hasDraft
      ? 'You have an unfinished donation draft waiting.'
      : 'Good food deserves another plate.';
    const action = document.getElementById('welcome-toast-action');
    action.hidden = !hasDraft;

    let timer = 0;
    const dismiss = () => {
      clearTimeout(timer);
      welcome.classList.add('is-leaving');
      setTimeout(() => {
        welcome.hidden = true;
        welcome.classList.remove('is-leaving');
      }, 220);
    };
    const startTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(dismiss, 6000);
    };

    action.addEventListener('click', () => {
      dismiss();
      document.querySelector('.donate-trigger')?.click();
    });
    document.getElementById('welcome-toast-close').addEventListener('click', dismiss);
    // Hold the message while the pointer is on it, so it doesn't vanish mid-read.
    welcome.addEventListener('mouseenter', () => clearTimeout(timer));
    welcome.addEventListener('mouseleave', startTimer);

    // The nav is sticky and its height changes with the breakpoint, so place the card just below wherever it ends.
    const nav = document.querySelector('.glass-nav');
    if (nav) welcome.style.top = `${Math.round(nav.getBoundingClientRect().bottom) + 12}px`;
    welcome.hidden = false;
    startTimer();
  });

  // mouseover / mouseout: spotlight the step the visitor is reading and fade the others.
  // Both events bubble, so one pair of listeners on the grid covers all three cards.
  const grid = document.querySelector('.steps-grid');
  if (grid) {
    const cards = grid.querySelectorAll('.step-card');
    grid.addEventListener('mouseover', event => {
      const active = event.target.closest('.step-card');
      if (!active) return;
      cards.forEach(card => {
        card.classList.toggle('is-active', card === active);
        card.classList.toggle('is-dimmed', card !== active);
      });
    });
    grid.addEventListener('mouseout', event => {
      // mouseout also fires when moving between children of a card; only reset once the pointer leaves the grid.
      if (grid.contains(event.relatedTarget)) return;
      cards.forEach(card => card.classList.remove('is-active', 'is-dimmed'));
    });
  }

  // resize: the mobile menu is hidden by CSS at desktop widths but would stay "open" -
  // close it so it isn't already expanded when the window is narrowed again.
  const menu = document.querySelector('.mobile-menu');
  const desktop = 768;
  if (menu) {
    window.addEventListener('resize', () => {
      if (window.innerWidth >= desktop && menu.open) menu.open = false;
    });
    // Choosing a link should also close the menu instead of leaving it covering the page.
    menu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => { menu.open = false; });
    });
  }
})();
