import axios from 'axios';
import { BASE_URL } from '../constants';

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

const readAuth = () => {
    try {
        return JSON.parse(localStorage.getItem('auth') || 'null');
    } catch {
        return null;
    }
};

const clearAuthAndRedirect = () => {
    localStorage.removeItem('auth');
    if (window.location.pathname !== '/login') {
        window.location.href = '/login';
    }
};

// Always attach the freshest access token from localStorage (the source of truth).
// This overrides any Authorization header a component set from React state, so a
// silently-refreshed token is used even before context re-renders.
api.interceptors.request.use((config) => {
    const stored = readAuth();
    if (stored?.access) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${stored.access}`;
    }
    return config;
});

// Single-flight refresh: concurrent 401s all await the same refresh call.
let refreshPromise = null;

async function refreshAccessToken() {
    const stored = readAuth();
    if (!stored?.refresh) throw new Error('no refresh token');
    // Use a bare axios instance so this call does NOT recurse through the interceptors.
    // Join carefully: BASE_URL has no trailing slash (".../api"), so a plain
    // `${BASE_URL}users/...` concatenation yields ".../apiusers/..." → 404 → logout.
    const base = BASE_URL.endsWith('/') ? BASE_URL : `${BASE_URL}/`;
    const res = await axios.post(`${base}users/token/refresh/`, {
        refresh: stored.refresh,
    });
    // Backend runs ROTATE_REFRESH_TOKENS + BLACKLIST_AFTER_ROTATION: each refresh
    // returns a NEW refresh token and blacklists the one we just sent. We MUST persist
    // the rotated refresh, or the next refresh sends a blacklisted token → 401 → logout.
    const next = {
        ...stored,
        access: res.data.access,
        refresh: res.data.refresh || stored.refresh,
    };
    localStorage.setItem('auth', JSON.stringify(next));
    return res.data.access;
}

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config;
        const status = error.response?.status;

        // Only try to recover from an expired ACCESS token (401). A 403 is a genuine
        // permission denial — don't destroy the session for it.
        if (status === 401 && original && !original._retry) {
            const isRefreshCall = original.url?.includes('token/refresh');
            const stored = readAuth();
            if (stored?.refresh && !isRefreshCall) {
                original._retry = true;
                try {
                    if (!refreshPromise) {
                        refreshPromise = refreshAccessToken().finally(() => {
                            refreshPromise = null;
                        });
                    }
                    const newAccess = await refreshPromise;
                    original.headers = original.headers || {};
                    original.headers.Authorization = `Bearer ${newAccess}`;
                    return api(original);
                } catch (refreshErr) {
                    clearAuthAndRedirect();
                    return Promise.reject(refreshErr);
                }
            }
            // No refresh token, or the refresh call itself failed → session is over.
            clearAuthAndRedirect();
        }
        return Promise.reject(error);
    }
);

export default api;
