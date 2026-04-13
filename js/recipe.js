// Kitchen HQ — Recipe Generator
const Recipe = {
  // --- Protein Data ---
  proteins: {
    chicken: {
      emoji: '\u{1F414}',
      label: 'Chicken',
      cuts: [
        { id: 'chicken-thighs-bone-in', label: 'Thighs\n(bone-in)' },
        { id: 'chicken-thighs-boneless', label: 'Thighs\n(boneless)' },
        { id: 'chicken-breasts', label: 'Breasts' },
        { id: 'chicken-whole', label: 'Whole\nChicken' },
        { id: 'chicken-wings', label: 'Wings' },
        { id: 'chicken-drumsticks', label: 'Drumsticks' },
        { id: 'chicken-ground', label: 'Ground\nChicken' },
      ]
    },
    beef: {
      emoji: '\u{1F969}',
      label: 'Beef',
      cuts: [
        { id: 'beef-ribeye', label: 'Ribeye' },
        { id: 'beef-ny-strip', label: 'NY Strip' },
        { id: 'beef-filet', label: 'Filet' },
        { id: 'beef-flank', label: 'Flank' },
        { id: 'beef-stew-meat', label: 'Stew Meat' },
        { id: 'beef-ground', label: 'Ground Beef' },
        { id: 'beef-short-ribs', label: 'Short Ribs' },
        { id: 'beef-brisket', label: 'Brisket' },
      ]
    },
    pork: {
      emoji: '\u{1F416}',
      label: 'Pork',
      cuts: [
        { id: 'pork-chops', label: 'Chops' },
        { id: 'pork-tenderloin', label: 'Tenderloin' },
        { id: 'pork-shoulder', label: 'Shoulder' },
        { id: 'pork-ribs', label: 'Ribs' },
        { id: 'pork-ground', label: 'Ground Pork' },
        { id: 'pork-belly', label: 'Belly' },
        { id: 'pork-sausage', label: 'Sausage' },
      ]
    },
    seafood: {
      emoji: '\u{1F41F}',
      label: 'Seafood',
      cuts: [
        { id: 'seafood-salmon', label: 'Salmon' },
        { id: 'seafood-shrimp', label: 'Shrimp' },
        { id: 'seafood-tuna', label: 'Tuna' },
        { id: 'seafood-cod', label: 'Cod' },
        { id: 'seafood-scallops', label: 'Scallops' },
        { id: 'seafood-mussels', label: 'Mussels' },
        { id: 'seafood-crab', label: 'Crab' },
      ]
    },
    lamb: {
      emoji: '\u{1F411}',
      label: 'Lamb',
      cuts: [
        { id: 'lamb-chops', label: 'Chops' },
        { id: 'lamb-leg', label: 'Leg' },
        { id: 'lamb-shoulder', label: 'Shoulder' },
        { id: 'lamb-ground', label: 'Ground Lamb' },
        { id: 'lamb-rack', label: 'Rack' },
        { id: 'lamb-shanks', label: 'Shanks' },
      ]
    },
    turkey: {
      emoji: '\u{1F983}',
      label: 'Turkey',
      cuts: [
        { id: 'turkey-breast', label: 'Breast' },
        { id: 'turkey-ground', label: 'Ground\nTurkey' },
        { id: 'turkey-thighs', label: 'Thighs' },
        { id: 'turkey-whole', label: 'Whole\nTurkey' },
      ]
    },
    plant: {
      emoji: '\u{1F331}',
      label: 'Plant-Based',
      cuts: [
        { id: 'plant-tofu', label: 'Tofu' },
        { id: 'plant-tempeh', label: 'Tempeh' },
        { id: 'plant-beans', label: 'Beans' },
        { id: 'plant-lentils', label: 'Lentils' },
        { id: 'plant-chickpeas', label: 'Chickpeas' },
      ]
    }
  },

  selectedCategory: null,
  selectedCuts: [],   // Array of { id, label, category }
  conversationHistory: [],
  currentRecipeId: null,
  isGenerating: false,
  showingHistory: false,

  init() {
    this.categoriesEl = document.getElementById('protein-categories');
    this.cutsEl = document.getElementById('protein-cuts');
    this.cutsLabel = document.getElementById('cuts-label');
    this.selectedSummary = document.getElementById('selected-proteins');
    this.extraInput = document.getElementById('extra-instructions');
    this.generateBtn = document.getElementById('generate-btn');
    this.recipeDisplay = document.getElementById('recipe-display');
    this.recipeTitleEl = document.getElementById('recipe-title');
    this.recipeMetaEl = document.getElementById('recipe-meta');
    this.recipeBodyEl = document.getElementById('recipe-body');
    this.favBtn = document.getElementById('fav-btn');
    this.regenerateBtn = document.getElementById('regenerate-btn');
    this.historyToggle = document.getElementById('history-toggle');
    this.historyView = document.getElementById('history-view');
    this.historyList = document.getElementById('history-list');
    this.historyBack = document.getElementById('history-back');

    this.renderCategories();
    this.setupEventListeners();
  },

  renderCategories() {
    this.categoriesEl.innerHTML = '';
    for (const [key, cat] of Object.entries(this.proteins)) {
      const card = document.createElement('div');
      card.className = 'protein-card';
      card.dataset.category = key;
      card.innerHTML = `
        <span class="card-emoji">${cat.emoji}</span>
        <span class="card-label">${cat.label}</span>
      `;
      card.addEventListener('click', () => this.selectCategory(key));
      this.categoriesEl.appendChild(card);
    }
  },

  selectCategory(key) {
    this.selectedCategory = key;

    // Highlight selected category
    this.categoriesEl.querySelectorAll('.protein-card').forEach(card => {
      card.classList.toggle('selected', card.dataset.category === key);
    });

    // Show cuts for this category
    this.renderCuts(key);
  },

  renderCuts(categoryKey) {
    const category = this.proteins[categoryKey];
    this.cutsEl.innerHTML = '';
    this.cutsLabel.hidden = false;

    for (const cut of category.cuts) {
      const card = document.createElement('div');
      card.className = 'protein-card';
      card.dataset.cutId = cut.id;

      // Check if already selected
      if (this.selectedCuts.some(s => s.id === cut.id)) {
        card.classList.add('selected');
      }

      card.innerHTML = `
        <span class="card-emoji">${category.emoji}</span>
        <span class="card-label">${cut.label}</span>
      `;
      card.addEventListener('click', () => this.toggleCut(cut, categoryKey));
      this.cutsEl.appendChild(card);
    }
  },

  toggleCut(cut, categoryKey) {
    const idx = this.selectedCuts.findIndex(s => s.id === cut.id);
    if (idx >= 0) {
      this.selectedCuts.splice(idx, 1);
    } else {
      this.selectedCuts.push({
        id: cut.id,
        label: cut.label.replace('\n', ' '),
        category: this.proteins[categoryKey].label
      });
    }

    // Re-render cuts to update selection state
    this.renderCuts(categoryKey);
    this.renderSelectedSummary();
    this.updateGenerateButton();
  },

  renderSelectedSummary() {
    if (this.selectedCuts.length === 0) {
      this.selectedSummary.hidden = true;
      return;
    }

    this.selectedSummary.hidden = false;
    this.selectedSummary.innerHTML = this.selectedCuts.map(cut => `
      <span class="selected-chip">
        ${cut.category} — ${cut.label}
        <button class="chip-remove" data-cut-id="${cut.id}">&times;</button>
      </span>
    `).join('');

    // Bind remove buttons
    this.selectedSummary.querySelectorAll('.chip-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const cutId = btn.dataset.cutId;
        this.selectedCuts = this.selectedCuts.filter(c => c.id !== cutId);
        this.renderSelectedSummary();
        this.updateGenerateButton();
        // Re-render cuts if showing the category that contained this cut
        if (this.selectedCategory) {
          this.renderCuts(this.selectedCategory);
        }
      });
    });
  },

  updateGenerateButton() {
    this.generateBtn.disabled = this.selectedCuts.length === 0 || this.isGenerating;
  },

  setupEventListeners() {
    this.generateBtn.addEventListener('click', () => this.generate());
    this.regenerateBtn.addEventListener('click', () => this.regenerate());
    this.favBtn.addEventListener('click', () => this.toggleFavorite());
    this.historyToggle.addEventListener('click', () => this.showHistory());
    this.historyBack.addEventListener('click', () => this.hideHistory());

    // History tabs
    document.querySelectorAll('.history-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.history-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.loadHistoryTab(tab.dataset.tab);
      });
    });

    // Allow Enter in extra instructions to generate
    this.extraInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !this.generateBtn.disabled) {
        this.generate();
      }
    });
  },

  // --- Generation (implemented in Task 7) ---
  async generate() {
    // Placeholder — implemented in Task 7
  },

  async regenerate() {
    // Placeholder — implemented in Task 7
  },

  async toggleFavorite() {
    // Placeholder — implemented in Task 7
  },

  showHistory() {
    // Placeholder — implemented in Task 7
  },

  hideHistory() {
    // Placeholder — implemented in Task 7
  },

  loadHistoryTab(tab) {
    // Placeholder — implemented in Task 7
  }
};
