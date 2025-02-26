/**
 * Utility functions for API calls that work in both web and Electron contexts
 */

/**
 * Get the base URL for API requests
 * This ensures API calls work in both web browser and Electron contexts
 */
export function getApiBaseUrl(): string {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
        // In Electron, we need to use the full URL with hostname
        return window.location.hostname === 'localhost'
            ? 'http://localhost:3000/api'
            : '/api';
    }

    // Server-side, use relative path
    return '/api';
}

/**
 * Make a GET request to the API
 */
export async function apiGet<T>(endpoint: string): Promise<T> {
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/${endpoint}`);

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(error.error || `API error: ${response.status}`);
    }

    return response.json();
}

/**
 * Make a POST request to the API
 */
export async function apiPost<T>(endpoint: string, data: any): Promise<T> {
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/${endpoint}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(error.error || `API error: ${response.status}`);
    }

    return response.json();
}

/**
 * Make a PUT request to the API
 */
export async function apiPut<T>(endpoint: string, data: any): Promise<T> {
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/${endpoint}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(error.error || `API error: ${response.status}`);
    }

    return response.json();
}

/**
 * Make a DELETE request to the API
 */
export async function apiDelete<T>(endpoint: string): Promise<T> {
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/${endpoint}`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(error.error || `API error: ${response.status}`);
    }

    return response.json();
} 