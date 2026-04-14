// Kitchen HQ — Main app controller
const App = {
  currentPage: 0,
  totalPages: 2,
  touchStartX: 0,
  touchStartY: 0,
  touchDeltaX: 0,
  isSwiping: false,
  idleTimer: null,
  clockInterval: null,

  init() {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(err => {
        console.warn('SW registration failed:', err);
      });
    }

    this.pages = document.getElementById('pages');
    this.clockEl = document.getElementById('clock');
    this.settingsBtn = document.getElementById('settings-btn');

    this.setupSwipe();
    this.setupClock();
    this.setupIdleDetection();

    // Init sub-modules
    Settings.init();
    Storage.init().then(() => {
      Recipe.init();
    });
    Calendar.init();
    Screensaver.init();

    this.settingsBtn.addEventListener('click', () => Settings.open());
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

  // --- Idle Detection ---
  setupIdleDetection() {
    const events = ['touchstart', 'touchmove', 'click', 'keydown'];
    const resetIdle = () => this.resetIdleTimer();
    events.forEach(evt => document.addEventListener(evt, resetIdle, { passive: true }));
    this.resetIdleTimer();
  },

  resetIdleTimer() {
    clearTimeout(this.idleTimer);
    const timeoutMin = parseInt(localStorage.getItem('khq-idle-timeout') || '5', 10);
    this.idleTimer = setTimeout(() => {
      Screensaver.activate();
    }, timeoutMin * 60 * 1000);
  }
};

// Boot
document.addEventListener('DOMContentLoaded', () => App.init());
