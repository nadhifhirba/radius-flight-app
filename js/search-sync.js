// Patches the existing search flow to auto-save to Supabase
document.addEventListener('DOMContentLoaded', () => {
    Auth.init();

    const searchBtn = document.querySelector('button[onclick*="search"], #search-btn, button[type="submit"]');
    // Also hook via form submit if present
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', () => {
            const origin = document.getElementById('origin')?.value;
            const budget = document.getElementById('budget')?.value;
            if (origin && budget) Auth.saveSearch(origin, budget);
        });
    }
});
