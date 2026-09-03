/**
 * Web-specific token storage using localStorage.
 */

export async function getToken(): Promise<string | null> {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage.getItem('token');
  }
  return null;
}

export async function setToken(token: string): Promise<void> {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem('token', token);
  }
}

export async function removeToken(): Promise<void> {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.removeItem('token');
  }
}
