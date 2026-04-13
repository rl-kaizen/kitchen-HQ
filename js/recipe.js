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

  // --- Generation ---
  async generate() {
    if (this.selectedCuts.length === 0 || this.isGenerating) return;

    const apiKey = Settings.getApiKey();
    if (!apiKey) {
      Settings.open();
      return;
    }

    this.isGenerating = true;
    this.updateGenerateButton();
    this.generateBtn.textContent = 'Generating...';

    const proteinList = this.selectedCuts.map(c => `${c.category} ${c.label}`).join(', ');
    const extraInstructions = this.extraInput.value.trim();

    // Build user message
    let userMessage = `I have: ${proteinList}.`;
    if (extraInstructions) {
      userMessage += ` ${extraInstructions}`;
    }
    userMessage += ' What should I make?';

    // If this is a fresh generation (not a tweak), reset conversation
    if (this.conversationHistory.length === 0) {
      this.conversationHistory = [];
    }

    this.conversationHistory.push({ role: 'user', content: userMessage });

    try {
      const response = await this.callClaude(this.conversationHistory);

      this.conversationHistory.push({ role: 'assistant', content: response });

      // Parse and display
      this.displayRecipe(response, proteinList);

      // Save to history
      const title = this.parseTitle(response);
      const id = await Storage.saveRecipe({
        title: title,
        proteins: this.selectedCuts.map(c => `${c.category} ${c.label}`),
        body: response
      });
      this.currentRecipeId = id;
      this.favBtn.classList.remove('favorited');
      this.historyToggle.hidden = false;

    } catch (err) {
      console.error('Claude API error:', err);
      this.recipeDisplay.hidden = false;
      this.recipeTitleEl.textContent = 'Error';
      this.recipeBodyEl.innerHTML = `<p>Failed to generate recipe. ${err.message || 'Check your API key in Settings.'}</p>`;
      this.recipeMetaEl.textContent = '';
    }

    this.isGenerating = false;
    this.generateBtn.textContent = 'Generate';
    this.updateGenerateButton();
    this.extraInput.value = '';
  },

  async regenerate() {
    // Clear conversation to start fresh, then generate
    this.conversationHistory = [];
    await this.generate();
  },

  async callClaude(messages) {
    const apiKey = Settings.getApiKey();
    const systemPrompt = Settings.getKitchenPrompt();

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        system: systemPrompt,
        messages: messages
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `API error ${response.status}`);
    }

    const data = await response.json();
    return data.content[0].text;
  },

  parseTitle(markdown) {
    const match = markdown.match(/^#\s+(.+)$/m);
    return match ? match[1] : 'Untitled Recipe';
  },

  displayRecipe(markdown, proteinList) {
    this.recipeDisplay.hidden = false;

    // Parse title
    const title = this.parseTitle(markdown);
    this.recipeTitleEl.textContent = title;

    // Parse meta (prep/cook/total)
    const metaMatch = markdown.match(/\*\*Prep:\*\*\s*(.+?)\s*\|\s*\*\*Cook:\*\*\s*(.+?)\s*\|\s*\*\*Total:\*\*\s*(.+)/);
    if (metaMatch) {
      this.recipeMetaEl.innerHTML = `
        <span>Prep: ${metaMatch[1]}</span>
        <span>Cook: ${metaMatch[2]}</span>
        <span>Total: ${metaMatch[3]}</span>
      `;
    } else {
      this.recipeMetaEl.textContent = proteinList;
    }

    // Convert remaining markdown to HTML (simple conversion)
    let body = markdown;
    // Remove the title line
    body = body.replace(/^#\s+.+$/m, '');
    // Remove the meta line
    body = body.replace(/\*\*Prep:\*\*.+/m, '');

    // Convert ## headings to h3
    body = body.replace(/^##\s+(.+)$/gm, '<h3>$1</h3>');
    // Convert bold
    body = body.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Convert unordered lists
    body = body.replace(/^-\s+(.+)$/gm, '<li>$1</li>');
    body = body.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');
    // Convert ordered lists
    body = body.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');
    // Wrap consecutive <li> not in <ul> into <ol>
    body = body.replace(/(?<!<\/ul>\n?)(<li>.*<\/li>\n?)+/g, (match) => {
      if (body.indexOf(match) > body.indexOf('<ul>')) {
        return `<ol>${match}</ol>`;
      }
      return match;
    });
    // Convert line breaks
    body = body.replace(/\n\n/g, '<br>');

    this.recipeBodyEl.innerHTML = body.trim();

    // Scroll recipe into view
    this.recipeDisplay.scrollIntoView({ behavior: 'smooth', block: 'start' });
  },

  // --- Favorites ---
  async toggleFavorite() {
    if (!this.currentRecipeId) return;
    const isFav = await Storage.toggleFavorite(this.currentRecipeId);
    this.favBtn.classList.toggle('favorited', isFav);
  },

  // --- History / Favorites Views ---
  showHistory() {
    this.showingHistory = true;
    this.historyView.hidden = false;
    // Hide generator UI
    this.categoriesEl.parentElement.querySelector('.section-label').hidden = true;
    this.categoriesEl.hidden = true;
    this.cutsLabel.hidden = true;
    this.cutsEl.hidden = true;
    this.selectedSummary.hidden = true;
    document.querySelector('.input-row').hidden = true;
    this.recipeDisplay.hidden = true;
    this.historyToggle.hidden = true;

    this.loadHistoryTab('history');
  },

  hideHistory() {
    this.showingHistory = false;
    this.historyView.hidden = true;
    // Restore generator UI
    this.categoriesEl.parentElement.querySelector('.section-label').hidden = false;
    this.categoriesEl.hidden = false;
    if (this.selectedCategory) {
      this.cutsLabel.hidden = false;
      this.cutsEl.hidden = false;
    }
    this.renderSelectedSummary();
    document.querySelector('.input-row').hidden = false;
    if (this.currentRecipeId) {
      this.recipeDisplay.hidden = false;
      this.historyToggle.hidden = false;
    }
  },

  async loadHistoryTab(tab) {
    const recipes = tab === 'favorites' ? await Storage.getFavorites() : await Storage.getAllRecipes();

    if (recipes.length === 0) {
      this.historyList.innerHTML = `<p class="no-events">${tab === 'favorites' ? 'No saved favorites yet.' : 'No recipe history yet.'}</p>`;
      return;
    }

    this.historyList.innerHTML = recipes.map(r => `
      <div class="history-item" data-recipe-id="${r.id}">
        <div class="history-item-title">${r.title}</div>
        <div class="history-item-meta">${r.proteins.join(', ')} — ${new Date(r.timestamp).toLocaleDateString()}</div>
      </div>
    `).join('');

    // Bind click to view recipe
    this.historyList.querySelectorAll('.history-item').forEach(item => {
      item.addEventListener('click', async () => {
        const recipe = await Storage.getRecipe(Number(item.dataset.recipeId));
        if (recipe) {
          this.currentRecipeId = recipe.id;
          this.displayRecipe(recipe.body, recipe.proteins.join(', '));
          this.favBtn.classList.toggle('favorited', recipe.favorited);
          this.hideHistory();
          this.recipeDisplay.hidden = false;
          this.historyToggle.hidden = false;
        }
      });
    });
  },
};
