// Kitchen HQ — Main app controller
const App = {
  currentPage: 0,
  totalPages: 2,
  touchStartX: 0,
  touchStartY: 0,
  touchDeltaX: 0,
  isSwiping: false,
  clockInterval: null,

  init() {
    this.pages = document.getElementById('pages');
    this.clockEl = document.getElementById('clock');
    this.settingsBtn = document.getElementById('settings-btn');

    this.setupServiceWorker();
    this.setupOfflineIndicator();
    this.setupSwipe();
    this.setupKeyboard();
    this.setupClock();

    // Init sub-modules
    Settings.init();
    Storage.init().then(() => {
      Recipe.init();
    });
    Calendar.init();

    this.settingsBtn.addEventListener('click', () => Settings.open());

    // Auth banner reconnect
    document.getElementById('auth-banner-reconnect').addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        await GoogleAuth.authenticate();
        App.hideAuthBanner();
        Settings.updateGoogleAuthUI();
        Calendar.fetchEvents();
      } catch (err) {
        console.error('Reconnect failed:', err);
      }
    });

    // Update banner refresh
    document.getElementById('update-banner-refresh').addEventListener('click', async (e) => {
      e.preventDefault();
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg && reg.waiting) {
        reg.waiting.postMessage({ type: 'SKIP_WAITING' });
      } else {
        window.location.reload();
      }
    });
  },

  setupServiceWorker() {
    // DEV MODE: service worker disabled for fast iteration — re-enable before shipping
    // Unregister any previously installed SW so the browser fetches fresh on every load
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(regs => {
        regs.forEach(reg => reg.unregister());
      });
    }
  },

  setupOfflineIndicator() {
    const banner = document.getElementById('offline-banner');
    const update = () => { banner.hidden = navigator.onLine; };
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    update(); // Set initial state
  },

  showAuthBanner() {
    document.getElementById('auth-banner').hidden = false;
  },

  hideAuthBanner() {
    document.getElementById('auth-banner').hidden = true;
  },

  // --- Swipe Navigation ---
  setupSwipe() {
    const container = this.pages;

    container.addEventListener('touchstart', (e) => {
      this.touchStartX = e.touches[0].clientX;
      this.touchStartY = e.touches[0].clientY;
      this.touchDeltaX = 0;
      this.isSwiping = false;
      container.classList.add('swiping');
    }, { passive: true });

    container.addEventListener('touchmove', (e) => {
      const dx = e.touches[0].clientX - this.touchStartX;
      const dy = e.touches[0].clientY - this.touchStartY;

      // Determine if horizontal swipe (only on first significant move)
      if (!this.isSwiping && Math.abs(dx) > 10) {
        // Only capture as swipe if more horizontal than vertical
        if (Math.abs(dx) > Math.abs(dy)) {
          this.isSwiping = true;
        } else {
          return; // Let vertical scroll happen
        }
      }

      if (!this.isSwiping) return;

      this.touchDeltaX = dx;
      const baseOffset = -this.currentPage * 100;
      const dragOffset = (dx / window.innerWidth) * 100;
      container.style.transform = `translateX(${baseOffset + dragOffset}vw)`;
    }, { passive: true });

    container.addEventListener('touchend', () => {
      container.classList.remove('swiping');

      if (this.isSwiping) {
        const threshold = window.innerWidth * 0.2;
        if (this.touchDeltaX < -threshold && this.currentPage < this.totalPages - 1) {
          this.currentPage++;
        } else if (this.touchDeltaX > threshold && this.currentPage > 0) {
          this.currentPage--;
        }
      }

      this.snapToPage();
      this.isSwiping = false;
      this.touchDeltaX = 0;
    }, { passive: true });
  },

  snapToPage() {
    const offset = -this.currentPage * 100;
    this.pages.style.transform = `translateX(${offset}vw)`;
  },

  goToPage(index) {
    if (index >= 0 && index < this.totalPages) {
      this.currentPage = index;
      this.snapToPage();
    }
  },

  // --- Keyboard Navigation ---
  setupKeyboard() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') this.goToPage(this.currentPage + 1);
      else if (e.key === 'ArrowLeft') this.goToPage(this.currentPage - 1);
    });
  },

  // --- Clock ---
  setupClock() {
    this.updateClock();
    this.clockInterval = setInterval(() => this.updateClock(), 1000);
  },

  updateClock() {
    const now = new Date();
    let hours = now.getHours();
    const mins = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    this.clockEl.textContent = `${hours}:${mins} ${ampm}`;
  },

};

// Boot
document.addEventListener('DOMContentLoaded', () => App.init());
