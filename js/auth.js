// Auth module — depends on _supabase (window._supabase)
const Auth = (() => {
    let currentUser = null;

    async function init() {
        if (!window._supabase) return;
        const { data: { session } } = await _supabase.auth.getSession();
        if (session) setUser(session.user);
        _supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user || null);
        });
    }

    function setUser(user) {
        currentUser = user;
        const accountLink = document.getElementById('account-link');
        if (accountLink) {
            accountLink.querySelector('span').textContent = user ? 'My Trips' : 'Account';
        }
        if (user) syncSearchHistory();
    }

    async function signInWithGoogle() {
        if (!window._supabase) {
            showToast('Auth not configured yet', 'error');
            return;
        }
        await _supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: window.location.origin }
        });
    }

    async function signOut() {
        if (!window._supabase) return;
        await _supabase.auth.signOut();
        setUser(null);
        showToast('Signed out', 'info');
    }

    async function saveSearch(origin, maxPrice) {
        if (!currentUser || !window._supabase) return;
        await _supabase.from('searches').insert({
            user_id: currentUser.id,
            origin,
            max_price: parseInt(maxPrice)
        });
    }

    async function syncSearchHistory() {
        if (!currentUser || !window._supabase) return;
        // Merge localStorage history to Supabase
        const local = JSON.parse(localStorage.getItem('radiusHistory') || '[]');
        for (const item of local.slice(0, 5)) {
            await saveSearch(item.origin, item.budget).catch(() => {});
        }
    }

    return { init, signInWithGoogle, signOut, saveSearch, currentUser: () => currentUser };
})();

window.Auth = Auth;
window.triggerGoogleSignIn = () => Auth.signInWithGoogle();
