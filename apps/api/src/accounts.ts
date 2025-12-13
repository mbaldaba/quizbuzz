export interface AdminAccount {
	username: string;
	password: string;
	email?: string;
	role?: string;
	createdAt?: string;
}

// List of authenticated admin accounts
export const adminAccounts: AdminAccount[] = [
	{
		username: "admin",
		password: "admin123",
		email: "admin@quizbuzz.com",
		role: "admin",
		createdAt: new Date().toISOString(),
	},
	{
		username: "quizmaster",
		password: "quiz2024",
		email: "quizmaster@quizbuzz.com",
		role: "admin",
		createdAt: new Date().toISOString(),
	},
	{
		username: "teacher",
		password: "teacher123",
		email: "teacher@quizbuzz.com",
		role: "teacher",
		createdAt: new Date().toISOString(),
	},
];

/**
 * Find an account by username and password
 */
export function findAccount(
	username: string,
	password: string
): AdminAccount | null {
	return (
		adminAccounts.find(
			(account) =>
				account.username.toLowerCase() === username.toLowerCase().trim() &&
				account.password === password
		) || null
	);
}

/**
 * Find an account by username only
 */
export function findAccountByUsername(username: string): AdminAccount | null {
	return (
		adminAccounts.find(
			(account) =>
				account.username.toLowerCase() === username.toLowerCase().trim()
		) || null
	);
}

/**
 * Get all accounts (without passwords for security)
 */
export function getAllAccounts(): Omit<AdminAccount, "password">[] {
	return adminAccounts.map(({ password, ...account }) => account);
}

