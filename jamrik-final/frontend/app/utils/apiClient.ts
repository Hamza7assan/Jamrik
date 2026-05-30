export async function jamrikFetch(url: RequestInfo | URL, options?: RequestInit): Promise<Response> {
    const response = await fetch(url, options);

    // Skip redirect logic for authentication endpoints
    const urlStr = url.toString();
    if (urlStr.includes('/jamrik/login') || urlStr.includes('/jamrik/register')) {
        return response;
    }

    // 1. Handle HTTP 401 Unauthorized / 403 Forbidden
    if (response.status === 401 || response.status === 403) {
        console.warn(`Auth Error (${response.status}) on ${urlStr}`);
        handleSessionTimeout();
        throw new Error('Session Expired');
    }

    // 2. Handle HTML responses when JSON was expected (Spring Security Login Redirects)
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("text/html")) {
        console.warn(`Received HTML on ${urlStr}. Session likely expired.`);
        handleSessionTimeout();
        throw new Error('Session Expired: HTML response received instead of JSON');
    }

    return response;
}

function handleSessionTimeout() {
    // Only execute on client side
    if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
        window.location.href = '/loginpage';
    }
}
