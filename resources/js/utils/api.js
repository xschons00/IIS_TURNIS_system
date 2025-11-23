const DEFAULT_API_BASE_URL = 'http://localhost:8080';// na deploy -->'https://www.stud.fit.vutbr.cz/~xjakubk00';
//const DEFAULT_API_BASE_URL = 'https://www.stud.fit.vutbr.cz/~xjakubk00';

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

    // Include credentials by default for session-based auth
    const fetchOptions = {
        credentials: 'include',
        ...options
    };

    return fetch(url, fetchOptions);
};

/**
 * Helper to read the standard API payload shape ({ message, data }).
 * Falls back to the raw payload if no data wrapper is present.
 */
export const parseApiJson = async (response) => {
    try {
        const payload = await response.json();
        const hasDataKey = payload && typeof payload === 'object' && 'data' in payload;
        const hasMessageKey = payload && typeof payload === 'object' && 'message' in payload;

        return {
            data: hasDataKey ? payload.data : payload,
            message: hasMessageKey ? payload.message : null,
            raw: payload,
        };
    } catch (error) {
        return { data: null, message: null, raw: null };
    }
};
