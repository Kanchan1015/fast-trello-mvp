// central token utilities (minimizes duplication across the codebase)

// KEY used in storage
const TOKEN_KEY = "ft_token";

// set token
export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

// get token
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

// clear token
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// token logic is kept outside the components
