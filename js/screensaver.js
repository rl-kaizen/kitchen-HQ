// Kitchen HQ — Photo Screensaver
const Screensaver = {
  photos: [],
  currentIndex: 0,
  activeSlot: 'a', // alternates between 'a' and 'b' for crossfade
  cycleTimer: null,
  refreshTimer: null,
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
    this.showPhoto(this.photos[0]);

    // Fade in
    requestAnimationFrame(() => {
      this.overlay.classList.add('active');
    });

    // Start cycling
    const intervalMin = parseInt(localStorage.getItem('khq-photo-interval') || '5', 10);
    this.cycleTimer = setInterval(() => this.nextPhoto(), intervalMin * 60 * 1000);

    // Refresh URLs every 45 minutes (they expire after ~60 min)
    this.refreshTimer = setInterval(() => this.fetchPhotos(), 45 * 60 * 1000);
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
    }, 1500);

    clearInterval(this.cycleTimer);
    clearInterval(this.refreshTimer);
    this.cycleTimer = null;
    this.refreshTimer = null;

    // Reset idle timer
    App.resetIdleTimer();
  },

  showPhoto(photo) {
    const slot = this.activeSlot === 'a' ? this.photoA : this.photoB;
    const otherSlot = this.activeSlot === 'a' ? this.photoB : this.photoA;

    // Set new photo with sizing params
    const url = `${photo.baseUrl}=w2048-h1536`;
    slot.style.backgroundImage = `url(${url})`;

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

  // --- Google Photos Integration ---
  async fetchPhotos() {
    if (!GoogleAuth.isAuthenticated()) return;

    const albumName = localStorage.getItem('khq-photos-album') || '';
    if (!albumName) return;

    try {
      // Find the album
      const albums = await GoogleAuth.fetchJSON('https://photoslibrary.googleapis.com/v1/albums?pageSize=50');
      const album = albums.albums?.find(a => a.title === albumName);
      if (!album) {
        console.warn(`Album "${albumName}" not found`);
        return;
      }

      // Fetch media items from the album
      const token = await GoogleAuth.getToken();
      const response = await fetch('https://photoslibrary.googleapis.com/v1/mediaItems:search', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          albumId: album.id,
          pageSize: 100
        })
      });

      if (!response.ok) throw new Error(`Photos API error: ${response.status}`);
      const data = await response.json();

      if (data.mediaItems) {
        // Only include photos (not videos)
        this.photos = data.mediaItems.filter(item =>
          item.mimeType && item.mimeType.startsWith('image/')
        );
        this.cachePhotos();

        // Shuffle for variety
        this.shufflePhotos();
      }
    } catch (err) {
      console.error('Failed to fetch photos:', err);
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
      // Only cache baseUrls and IDs (URLs expire, but useful for initial render)
      const minimal = this.photos.map(p => ({ id: p.id, baseUrl: p.baseUrl, mimeType: p.mimeType }));
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
