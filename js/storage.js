// Kitchen HQ — IndexedDB and localStorage helpers
const Storage = {
  DB_NAME: 'kitchen-hq',
  DB_VERSION: 1,
  db: null,

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('recipes')) {
          const store = db.createObjectStore('recipes', { keyPath: 'id', autoIncrement: true });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('favorited', 'favorited', { unique: false });
        }
      };

      request.onsuccess = (e) => {
        this.db = e.target.result;
        resolve();
      };

      request.onerror = (e) => {
        console.error('IndexedDB error:', e.target.error);
        reject(e.target.error);
      };
    });
  },

  async saveRecipe(recipe) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('recipes', 'readwrite');
      const store = tx.objectStore('recipes');
      const request = store.add({
        title: recipe.title,
        proteins: recipe.proteins,
        body: recipe.body,
        timestamp: Date.now(),
        favorited: false
      });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async toggleFavorite(id) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('recipes', 'readwrite');
      const store = tx.objectStore('recipes');
      const getReq = store.get(id);
      getReq.onsuccess = () => {
        const recipe = getReq.result;
        recipe.favorited = !recipe.favorited;
        const putReq = store.put(recipe);
        putReq.onsuccess = () => resolve(recipe.favorited);
        putReq.onerror = () => reject(putReq.error);
      };
      getReq.onerror = () => reject(getReq.error);
    });
  },

  async getRecipe(id) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('recipes', 'readonly');
      const store = tx.objectStore('recipes');
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async getAllRecipes() {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('recipes', 'readonly');
      const store = tx.objectStore('recipes');
      const index = store.index('timestamp');
      const request = index.openCursor(null, 'prev'); // newest first
      const results = [];
      request.onsuccess = (e) => {
        const cursor = e.target.result;
        if (cursor) {
          results.push(cursor.value);
          cursor.continue();
        } else {
          resolve(results);
        }
      };
      request.onerror = () => reject(request.error);
    });
  },

  async getFavorites() {
    const all = await this.getAllRecipes();
    return all.filter(r => r.favorited);
  }
};
