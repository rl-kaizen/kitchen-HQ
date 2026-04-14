// Kitchen HQ — Photo Screensaver (Google Drive)
const Screensaver = {
  photos: [],
  currentIndex: 0,
  activeSlot: 'a', // alternates between 'a' and 'b' for crossfade
  cycleTimer: null,
  isActive: false,

  init() {
    this.overlay = document.getElementById('screensaver');
    this.photoA = document.getElementById('screensaver-photo-a');
    this.photoB = document.getElementById('screensaver-photo-b');

    // Tap to dismiss
    this.overlay.addEventListener('click', () => this.deactivate());

    // Load cached photos
    this.loadCachedPhotos();
  },

  async activate() {
    if (this.isActive) return;
    if (this.photos.length === 0) {
      await this.fetchPhotos();
      if (this.photos.length === 0) return; // No photos available
    }

    this.isActive = true;
    document.body.classList.add('screensaver-active');
    this.overlay.hidden = false;

    // Show first photo immediately
    this.currentIndex = 0;
    this.shufflePhotos();
    this.showPhoto(this.photos[0]);

    // Fade in
    requestAnimationFrame(() => {
      this.overlay.classList.add('active');
    });

    // Start cycling
    const intervalMin = parseInt(localStorage.getItem('khq-photo-interval') || '5', 10);
    this.cycleTimer = setInterval(() => this.nextPhoto(), intervalMin * 60 * 1000);
  },

  deactivate() {
    if (!this.isActive) return;
    this.isActive = false;

    this.overlay.classList.remove('active');
    document.body.classList.remove('screensaver-active');

    // After fade-out transition, hide
    setTimeout(() => {
      this.overlay.hidden = true;
      this.photoA.classList.remove('visible', 'ken-burns');
      this.photoB.classList.remove('visible', 'ken-burns');
      this.photoA.style.backgroundImage = '';
      this.photoB.style.backgroundImage = '';
      // Revoke blob URLs to free memory
      if (this.photoA._blobUrl) { URL.revokeObjectURL(this.photoA._blobUrl); this.photoA._blobUrl = null; }
      if (this.photoB._blobUrl) { URL.revokeObjectURL(this.photoB._blobUrl); this.photoB._blobUrl = null; }
    }, 1500);

    clearInterval(this.cycleTimer);
    this.cycleTimer = null;

    // Reset idle timer
    App.resetIdleTimer();
  },

  async showPhoto(photo) {
    const slot = this.activeSlot === 'a' ? this.photoA : this.photoB;
    const otherSlot = this.activeSlot === 'a' ? this.photoB : this.photoA;

    try {
      // Check token is still valid before fetching
      if (!GoogleAuth.isAuthenticated()) {
        this.deactivate();
        App.showAuthBanner();
        return;
      }
      // Fetch image via Drive API with auth token (PWA standalone mode has no cookies)
      const token = await GoogleAuth.getToken();
      const res = await fetch(
        `https://www.googleapis.com/drive/v3/files/${photo.id}?alt=media`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error(`Drive fetch ${res.status}`);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);

      // Revoke previous blob URL to avoid memory leaks
      const prev = slot._blobUrl;
      if (prev) URL.revokeObjectURL(prev);
      slot._blobUrl = blobUrl;

      slot.style.backgroundImage = `url(${blobUrl})`;
    } catch (err) {
      console.error('Failed to load photo:', err);
      return;
    }

    // Ken Burns: randomize direction
    slot.style.transformOrigin = this.randomOrigin();
    slot.classList.remove('ken-burns');
    void slot.offsetWidth; // force reflow
    slot.classList.add('ken-burns');

    // Crossfade
    slot.classList.add('visible');
    otherSlot.classList.remove('visible');

    // Alternate slot for next photo
    this.activeSlot = this.activeSlot === 'a' ? 'b' : 'a';
  },

  nextPhoto() {
    if (this.photos.length === 0) return;
    this.currentIndex = (this.currentIndex + 1) % this.photos.length;
    this.showPhoto(this.photos[this.currentIndex]);
  },

  randomOrigin() {
    const positions = ['center', 'top left', 'top right', 'bottom left', 'bottom right', 'center top', 'center bottom'];
    return positions[Math.floor(Math.random() * positions.length)];
  },

  // --- Google Drive Integration ---
  async fetchPhotos() {
    if (!GoogleAuth.isAuthenticated()) return;

    const folderId = localStorage.getItem('khq-photos-folder') || '';
    if (!folderId) return;

    try {
      // Fetch image files from the selected Drive folder
      const query = `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`;
      const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType)&pageSize=200`;
      const data = await GoogleAuth.fetchJSON(url);

      if (data.files && data.files.length > 0) {
        this.photos = data.files;
        this.cachePhotos();
        this.shufflePhotos();
      }
    } catch (err) {
      console.error('Failed to fetch photos from Drive:', err);
    }
  },

  shufflePhotos() {
    for (let i = this.photos.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.photos[i], this.photos[j]] = [this.photos[j], this.photos[i]];
    }
  },

  cachePhotos() {
    try {
      const minimal = this.photos.map(p => ({ id: p.id, name: p.name, mimeType: p.mimeType }));
      localStorage.setItem('khq-photos-cache', JSON.stringify(minimal));
    } catch (e) {
      // Ignore storage errors
    }
  },

  loadCachedPhotos() {
    try {
      const cached = localStorage.getItem('khq-photos-cache');
      if (cached) this.photos = JSON.parse(cached);
    } catch (e) {
      this.photos = [];
    }
  }
};
