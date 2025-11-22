const DEFAULT_API_BASE_URL = 'http://localhost:8080';// na deploy -->'https://www.stud.fit.vutbr.cz/~xjakubk00';

/**
 * Resolve API base URL using Vite env, falls back to localhost for dev.
 */
export const API_BASE_URL = (() => {
    const fromEnv = import.meta.env?.VITE_API_BASE_URL;
    if (!fromEnv) {
        return DEFAULT_API_BASE_URL;
    }

    // Trim trailing slash so concatenation stays predictable.
    return fromEnv.endsWith('/') ? fromEnv.slice(0, -1) : fromEnv;
})();

/**
 * Wrapper around fetch that prefixes relative endpoints with configured API URL.
 * @param {string} endpoint API path such as /api/teams or a full URL.
 * @param {RequestInit} options Regular fetch options (method, headers, body, etc.).
 */
export const apiFetch = (endpoint, options = {}) => {
    const isAbsolute = /^https?:\/\//i.test(endpoint);
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = isAbsolute ? endpoint : `${API_BASE_URL}${normalizedEndpoint}`;

    return fetch(url, options);
};
