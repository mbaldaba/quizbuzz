export function setToken(token: string): void {
	window.localStorage.setItem("auth-token", token);
}

export function removeToken(): void {
	window.localStorage.removeItem("auth-token");
}

export function getToken(): string | null {
	return window.localStorage.getItem("auth-token");
}
