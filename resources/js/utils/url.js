const DEFAULT_APP_BASE_URL = 'http://localhost:8080';// na deploy -->'https://www.stud.fit.vutbr.cz/~xjakubk00';

//const DEFAULT_APP_BASE_URL = 'https://www.stud.fit.vutbr.cz/~xjakubk00';

/**
 * Resolve the React app base URL from Vite env variables, trimming trailing slash.
 */
export const APP_BASE_URL = (() => {
    const fromEnv = import.meta.env?.VITE_APP_BASE_URL;
    if (!fromEnv) {
        return DEFAULT_APP_BASE_URL;
    }

    return fromEnv.endsWith('/') ? fromEnv.slice(0, -1) : fromEnv;
})();

/**
 * Build a full URL relative to the configured base path.
 * @param {string} path Path starting with '/' (or without, it will be normalized).
 */
export const appUrl = (path = '/') => {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${APP_BASE_URL}${normalizedPath}`;
};
