// Kitchen HQ — Settings panel
const Settings = {
  panel: null,
  backdrop: null,
  isOpen: false,

  DEFAULT_KITCHEN_PROMPT: `You are a recipe assistant for a well-stocked home kitchen. The kitchen always has the following ingredients, (and usually more):

AROMATICS: onion, garlic, shallots, ginger, green onions

HERBS: cilantro, parsley, thyme, rosemary, basil (dried and often fresh)

SPICE CABINET: salt, black pepper, paprika, smoked paprika, cumin, chili powder, cayenne, oregano, cinnamon, nutmeg, turmeric, coriander, red pepper flakes, bay leaves, Italian seasoning, curry powders and their component spices, mustard powder, cardamom, tarragon, sage

CONDIMENTS: soy sauce, fish sauce, Worcestershire, hot sauce, Dijon mustard, mayonnaise, ketchup, olive oil, vegetable oil, sesame oil, rice vinegar, balsamic vinegar, white wine vinegar, honey, maple syrup

STAPLES: rice (white and brown), pasta (various shapes), potatoes, flour, sugar, butter, eggs, milk, chicken broth, canned tomatoes, tomato paste, coconut milk, breadcrumbs, panko

OTHER COMMON ITEMS: lemons, limes, anchovies, capers, olives, Parmesan cheese, cream cheese, sour cream

Assume all of the above are available. List ALL ingredients used in the recipe (including pantry staples) with exact measurements so the cook can gather everything before starting.

When generating a recipe, format your response EXACTLY as follows:

# [Recipe Title]

**Prep:** [X min] | **Cook:** [Y min] | **Total:** [Z min]

## Ingredients
- [List every ingredient with exact measurements, including pantry items]

## Instructions
1. [Step 1]
2. [Step 2]
...

Keep recipes practical and achievable for a home cook who has spent time in restaurant kitchens, they aren't chefs, but they are used to cooking ten home meals each week. Be specific about cuts of meat, temperatures, and timing.`,

  init() {
    this.panel = document.getElementById('settings-panel');
    this.backdrop = document.getElementById('settings-backdrop');

    // Bind controls
    this.apiKeyInput = document.getElementById('setting-api-key');
    this.kitchenPromptInput = document.getElementById('setting-kitchen-prompt');
    this.closeBtn = document.getElementById('settings-close');
    this.googleAuthBtn = document.getElementById('google-auth-btn');
    this.googleAuthStatus = document.getElementById('google-auth-status');
    this.googleClientIdInput = document.getElementById('setting-google-client-id');

    // Load saved values
    this.load();

    // Event listeners
    this.closeBtn.addEventListener('click', () => this.close());
    this.backdrop.addEventListener('click', () => this.close());

    this.apiKeyInput.addEventListener('change', () => this.save());
    this.kitchenPromptInput.addEventListener('change', () => this.save());

    // Google Client ID — load and save
    this.googleClientIdInput.value = localStorage.getItem('khq-google-client-id') || '';
    this.googleClientIdInput.addEventListener('change', () => {
      localStorage.setItem('khq-google-client-id', this.googleClientIdInput.value.trim());
    });

    // Google Auth button
    this.googleAuthBtn.addEventListener('click', async () => {
      if (GoogleAuth.isAuthenticated()) {
        GoogleAuth.disconnect();
        this.updateGoogleAuthUI();
      } else {
        try {
          await GoogleAuth.authenticate();
          this.updateGoogleAuthUI();
          Calendar.fetchEvents();
        } catch (err) {
          this.googleAuthStatus.textContent = `Error: ${err.message}`;
          this.googleAuthStatus.style.color = 'var(--color-danger, #e55)';
        }
      }
    });

    // Initialise GoogleAuth and reflect current state in the UI
    GoogleAuth.init();
    this.updateGoogleAuthUI();
  },

  updateGoogleAuthUI() {
    if (GoogleAuth.isAuthenticated()) {
      this.googleAuthBtn.textContent = 'Disconnect Google';
      this.googleAuthStatus.textContent = 'Connected';
      this.googleAuthStatus.style.color = 'var(--color-success, #4c4)';
    } else {
      this.googleAuthBtn.textContent = 'Connect Google Account';
      this.googleAuthStatus.textContent = 'Not connected';
      this.googleAuthStatus.style.color = 'var(--color-muted, #999)';
    }
  },

  load() {
    this.apiKeyInput.value = localStorage.getItem('khq-api-key') || '';
    this.kitchenPromptInput.value = localStorage.getItem('khq-kitchen-prompt') || this.DEFAULT_KITCHEN_PROMPT;

  },

  save() {
    localStorage.setItem('khq-api-key', this.apiKeyInput.value);
    localStorage.setItem('khq-kitchen-prompt', this.kitchenPromptInput.value);
  },

  getApiKey() {
    return localStorage.getItem('khq-api-key') || '';
  },

  getKitchenPrompt() {
    return localStorage.getItem('khq-kitchen-prompt') || this.DEFAULT_KITCHEN_PROMPT;
  },

  open() {
    this.isOpen = true;
    this.panel.classList.add('open');
    this.backdrop.hidden = false;
  },

  close() {
    this.isOpen = false;
    this.panel.classList.remove('open');
    this.backdrop.hidden = true;
    this.save();
  }
};
