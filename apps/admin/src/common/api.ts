const API_BASE_URL = "http://localhost:4242";

export interface SessionResponse {
	id: string;
	username: string;
	type: string;
	sessionId: string;
	expiresAt: string;
}

export interface AdminAccount {
	username: string;
	email?: string;
	role?: string;
	createdAt?: string;
}

export interface AccountsResponse {
	success: boolean;
	accounts: AdminAccount[];
	count: number;
}

export interface ApiError {
	success: false;
	message: string;
}

export async function login(
	username: string,
	password: string
): Promise<SessionResponse> {
	const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		credentials: "include",
		body: JSON.stringify({ username, password }),
	});

	if (!response.ok) {
		const error = await response.json().catch(() => ({ message: "Login failed" }));
		throw new Error(error.message || "Login failed");
	}

	return response.json();
}

export async function getSession(): Promise<SessionResponse> {
	const response = await fetch(`${API_BASE_URL}/api/auth/session`, {
		method: "GET",
		credentials: "include",
	});

	if (!response.ok) {
		throw new Error("Not authenticated");
	}

	return response.json();
}

export async function logout(): Promise<void> {
	try {
		const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
			method: "POST",
			credentials: "include",
		});

		// Even if the response is not ok, we consider logout successful
		// because the cookie will be cleared on the client side
		if (!response.ok && response.status !== 401) {
			// Only throw for non-auth errors (network issues, etc.)
			const error = await response.json().catch(() => ({ message: "Logout failed" }));
			throw new Error(error.message || "Logout failed");
		}
	} catch (error) {
		// If it's a network error, we still want to clear local state
		// Only re-throw if it's a non-network error
		if (error instanceof TypeError) {
			// Network error - still consider logout successful for local state
			return;
		}
		throw error;
	}
}

export async function getAccounts(): Promise<AccountsResponse> {
	const response = await fetch(`${API_BASE_URL}/api/auth/accounts`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
		credentials: "include",
	});

	if (!response.ok) {
		const error = await response.json().catch(() => ({ message: "Failed to fetch accounts" }));
		throw new Error(error.message || "Failed to fetch accounts");
	}

	return response.json();
}

