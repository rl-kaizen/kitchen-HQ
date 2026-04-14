// Kitchen HQ — Recipe Generator

// HTML escape helper to prevent XSS
function escapeHTML(str) {
  const el = document.createElement('span');
  el.textContent = str;
  return el.innerHTML;
}

const Recipe = {
  // --- Icon CDN base ---
  ICON_CDN: 'https://directus.backend.getwicked.app/assets',

  // --- Protein Data ---
  proteins: {
    chicken: {
      emoji: '\u{1F414}',
      icon: '265acc8f-ec86-480c-b8af-5e627e469978/chicken-breast-raw.png',
      label: 'Chicken',
      cuts: [
        { id: 'chicken-thighs-bone-in', label: 'Bone-in\nThighs', emoji: '\u{1F357}', icon: 'e66107bf-a511-432e-b488-69be6816433b/chicken-thighs-bone-in.png' },
        { id: 'chicken-thighs-boneless', label: 'Boneless\nThighs', emoji: '\u{1F969}', icon: '49f75874-a616-40cf-9077-95b9d23c1c63/chicken-thighs-boneless.png' },
        { id: 'chicken-breasts', label: 'Breasts', emoji: '\u{1F953}', icon: '265acc8f-ec86-480c-b8af-5e627e469978/chicken-breast-raw.png' },
        { id: 'chicken-whole', label: 'Whole\nChicken', emoji: '\u{1F414}' },
        { id: 'chicken-wings', label: 'Wings', emoji: '\u{1F357}', icon: 'a5296ebc-0347-43cc-a2a9-8c550c8b7d2f/chicken-wings-raw.png' },
        { id: 'chicken-drumsticks', label: 'Drumsticks', emoji: '\u{1F356}', icon: '887e2063-73bd-4796-9e71-e51e133bb9bf/chicken-leg-raw.png' },
        { id: 'chicken-ground', label: 'Ground\nChicken', emoji: '\u{1F35D}' },
      ]
    },
    beef: {
      emoji: '\u{1F969}',
      icon: 'fcc20146-993a-4fef-a17e-5c0f9bb1eabd/beef-sirloin-steak-raw.png',
      label: 'Beef',
      cuts: [
        { id: 'beef-ribeye', label: 'Ribeye', emoji: '\u{1F969}', icon: 'fcc20146-993a-4fef-a17e-5c0f9bb1eabd/beef-sirloin-steak-raw.png' },
        { id: 'beef-ny-strip', label: 'NY Strip', emoji: '\u{1F969}', icon: 'fcc20146-993a-4fef-a17e-5c0f9bb1eabd/beef-sirloin-steak-raw.png' },
        { id: 'beef-filet', label: 'Filet', emoji: '\u{1F944}', icon: 'fcc20146-993a-4fef-a17e-5c0f9bb1eabd/beef-sirloin-steak-raw.png' },
        { id: 'beef-flank', label: 'Flank', emoji: '\u{1FAD4}', icon: 'fcc20146-993a-4fef-a17e-5c0f9bb1eabd/beef-sirloin-steak-raw.png' },
        { id: 'beef-stew-meat', label: 'Stew Meat', emoji: '\u{1F372}', icon: '928fa242-55f7-4244-b2db-0aa8eff2fb4a/beef-roast-raw.png' },
        { id: 'beef-ground', label: 'Ground Beef', emoji: '\u{1F354}', icon: '2e0d4f87-7c43-442c-a4ca-707e153b84bf/ground-beef-raw.png' },
        { id: 'beef-short-ribs', label: 'Short Ribs', emoji: '\u{1F356}', icon: '9571b491-957e-4370-8a4c-0c75b31f7272/beef-short-ribs-raw.png' },
        { id: 'beef-brisket', label: 'Brisket', emoji: '\u{1F525}', icon: '68a37f47-237a-4175-9674-c19212bb75d3/beef-brisket-raw.png' },
      ]
    },
    pork: {
      emoji: '\u{1F416}',
      label: 'Pork',
      cuts: [
        { id: 'pork-chops', label: 'Chops', emoji: '\u{1F969}', icon: 'e7ee6945-079f-444f-9838-78a6d0d3b018/ham-steak-raw.png' },
        { id: 'pork-tenderloin', label: 'Tenderloin', emoji: '\u{1F944}' },
        { id: 'pork-shoulder', label: 'Shoulder', emoji: '\u{1F356}', icon: '363f0992-bbca-4e0e-a09f-5d20178284ab/ham-bone-in.png' },
        { id: 'pork-ribs', label: 'Ribs', emoji: '\u{1F356}', icon: 'dff4e2e4-27b7-465d-8b66-9a05964fcfa4/beef-ribs-raw.png' },
        { id: 'pork-ground', label: 'Ground Pork', emoji: '\u{1F354}', icon: '72c12d56-044f-4c44-8bd6-81be83fd568d/ground-sausage.png' },
        { id: 'pork-belly', label: 'Belly', emoji: '\u{1F953}', icon: '887b5387-dcd1-48c6-8862-e99fe1dad48f/pancetta.png' },
        { id: 'pork-sausage', label: 'Sausage', emoji: '\u{1F32D}', icon: 'c7222057-8973-4394-8d46-93304b65026b/kielbasa-sausage.png' },
      ]
    },
    seafood: {
      emoji: '\u{1F41F}',
      icon: '4f11e547-9e8d-4af1-8fec-30c4cc19069a/coho-salmon-fillet-raw.png',
      label: 'Seafood',
      cuts: [
        { id: 'seafood-salmon', label: 'Salmon', emoji: '\u{1F3A3}', icon: '4f11e547-9e8d-4af1-8fec-30c4cc19069a/coho-salmon-fillet-raw.png' },
        { id: 'seafood-shrimp', label: 'Shrimp', emoji: '\u{1F990}' },
        { id: 'seafood-tuna', label: 'Tuna', emoji: '\u{1F41F}', icon: '941b05dc-addb-46c6-84e4-02aa687b4a61/halibut-steak-raw.png' },
        { id: 'seafood-cod', label: 'Cod', emoji: '\u{1F420}', icon: '87c35615-4001-4a82-a6f9-006cfe6dc627/cod-fillet-raw.png' },
        { id: 'seafood-scallops', label: 'Scallops', emoji: '\u{1F41A}', icon: '76bc76de-b5e8-4485-be00-d482d9dd160d/clams.png' },
        { id: 'seafood-mussels', label: 'Mussels', emoji: '\u{1F9AA}', icon: '9b81e8de-9d88-465d-88eb-d8bf80986dc3/blue-mussels.png' },
        { id: 'seafood-crab', label: 'Crab', emoji: '\u{1F980}', icon: '913e33f7-ba8a-4087-8b14-240f531427e1/lobster-tail-raw.png' },
      ]
    },
    lamb: {
      emoji: '\u{1F411}',
      icon: 'ec054192-7996-4bfc-9c5d-e173afee6700/lamb-chops-raw.png',
      label: 'Lamb',
      cuts: [
        { id: 'lamb-chops', label: 'Chops', emoji: '\u{1F969}', icon: 'ec054192-7996-4bfc-9c5d-e173afee6700/lamb-chops-raw.png' },
        { id: 'lamb-leg', label: 'Leg', emoji: '\u{1F356}', icon: '6c9087c3-65b7-4bbd-a6e9-ec77e12f2b61/lamb-leg-boneless-raw.png' },
        { id: 'lamb-shoulder', label: 'Shoulder', emoji: '\u{1F372}', icon: '724c59f9-c4ae-484d-84d8-28ef1205077b/lamb-shoulder-raw.png' },
        { id: 'lamb-ground', label: 'Ground Lamb', emoji: '\u{1F354}', icon: '1eaa9abd-51dd-4fb8-ab8b-91ff70954992/ground-lamb-raw.png' },
        { id: 'lamb-rack', label: 'Rack', emoji: '\u{1F525}', icon: 'ec054192-7996-4bfc-9c5d-e173afee6700/lamb-chops-raw.png' },
        { id: 'lamb-shanks', label: 'Shanks', emoji: '\u{1F356}', icon: '83be0299-4258-437e-8d4d-f9ca60bcc235/lamb-shank-raw.png' },
      ]
    },
    turkey: {
      emoji: '\u{1F983}',
      label: 'Turkey',
      cuts: [
        { id: 'turkey-breast', label: 'Breast', emoji: '\u{1F953}' },
        { id: 'turkey-ground', label: 'Ground\nTurkey', emoji: '\u{1F354}' },
        { id: 'turkey-thighs', label: 'Thighs', emoji: '\u{1F357}' },
        { id: 'turkey-whole', label: 'Whole\nTurkey', emoji: '\u{1F983}' },
      ]
    },
    plant: {
      emoji: '\u{1F331}',
      label: 'Plant-Based',
      cuts: [
        { id: 'plant-tofu', label: 'Tofu', emoji: '\u{1F9C8}' },
        { id: 'plant-tempeh', label: 'Tempeh', emoji: '\u{1F33E}' },
        { id: 'plant-beans', label: 'Beans', emoji: '\u{1FAD8}', icon: 'b5bb80fb-ee4d-439d-8350-b00bc0d04405/black-beans-canned.png' },
        { id: 'plant-lentils', label: 'Lentils', emoji: '\u{1F35B}', icon: '7aad7c02-a94d-4d83-af42-72321586411f/brown-lentils.png' },
        { id: 'plant-chickpeas', label: 'Chickpeas', emoji: '\u{1F95C}', icon: '96fc4f7b-30bb-4e5e-819b-5e4191c42638/chickpeas.png' },
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
      if (cat.icon) {
        card.innerHTML = `
          <img class="card-icon" src="${this.ICON_CDN}/${cat.icon}" alt="${cat.label}" loading="lazy">
          <span class="card-label">${cat.label}</span>
        `;
      } else {
        card.innerHTML = `
          <span class="card-emoji">${cat.emoji}</span>
          <span class="card-label">${cat.label}</span>
        `;
      }
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

      const iconPath = cut.icon || category.icon;
      if (iconPath) {
        card.innerHTML = `
          <img class="card-icon" src="${this.ICON_CDN}/${iconPath}" alt="${cut.label}" loading="lazy">
          <span class="card-label">${cut.label}</span>
        `;
      } else {
        card.innerHTML = `
          <span class="card-emoji">${cut.emoji || category.emoji}</span>
          <span class="card-label">${cut.label}</span>
        `;
      }
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

    // Debug: log raw markdown to diagnose list rendering
    console.log('[Recipe] Raw markdown from Claude:', JSON.stringify(markdown));

    // Convert remaining markdown to HTML (simple conversion)
    let body = markdown;
    // Strip any raw HTML tags to prevent XSS from API responses
    body = body.replace(/<[^>]*>/g, '');
    // Remove the title line
    body = body.replace(/^#\s+.+$/m, '');
    // Remove the meta line
    body = body.replace(/\*\*Prep:\*\*.+/m, '');

    // Convert ## headings to h3
    body = body.replace(/^##\s+(.+)$/gm, '<h3>$1</h3>');
    // Convert bold
    body = body.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Convert markdown to HTML line by line for reliable list handling
    const lines = body.split('\n');
    let html = '';
    let inUl = false;
    let inOl = false;

    for (const line of lines) {
      const trimmed = line.trim();
      const ulMatch = trimmed.match(/^-\s+(.+)/);
      const olMatch = trimmed.match(/^\d+\.\s+(.+)/);

      if (ulMatch) {
        if (!inUl) { if (inOl) { html += '</ol>'; inOl = false; } html += '<ul>'; inUl = true; }
        html += `<li>${ulMatch[1]}</li>`;
      } else if (olMatch) {
        if (!inOl) { if (inUl) { html += '</ul>'; inUl = false; } html += '<ol>'; inOl = true; }
        html += `<li>${olMatch[1]}</li>`;
      } else {
        if (inUl) { html += '</ul>'; inUl = false; }
        if (inOl) { html += '</ol>'; inOl = false; }
        if (trimmed === '') {
          html += ' ';
        } else {
          html += `<p>${trimmed}</p>`;
        }
      }
    }
    if (inUl) html += '</ul>';
    if (inOl) html += '</ol>';

    body = html;

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
        <div class="history-item-title">${escapeHTML(r.title)}</div>
        <div class="history-item-meta">${escapeHTML((r.proteins || []).join(', '))} — ${new Date(r.timestamp).toLocaleDateString()}</div>
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
