import { useEffect, useState } from "react";
import { getAccounts, AdminAccount } from "../../common/api";
import styles from "./AccountList.module.scss";

export default function AccountList() {
	const [accounts, setAccounts] = useState<AdminAccount[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		const fetchAccounts = async () => {
			try {
				setLoading(true);
				setError("");
				const response = await getAccounts();
				setAccounts(response.accounts);
			} catch (err) {
				const errorMessage = err instanceof Error ? err.message : "Failed to load accounts";
				setError(errorMessage);
			} finally {
				setLoading(false);
			}
		};

		fetchAccounts();
	}, []);

	if (loading) {
		return (
			<div className={styles.accountListContainer}>
				<p className={styles.loadingText}>Loading accounts...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className={styles.accountListContainer}>
				<p className={styles.errorText}>{error}</p>
			</div>
		);
	}

	return (
		<div className={styles.accountListContainer}>
			<div className={styles.header}>
				<h2 className={styles.title}>Authenticated Accounts</h2>
				<span className={styles.badge}>{accounts.length} accounts</span>
			</div>

			{accounts.length === 0 ? (
				<p className={styles.emptyText}>No accounts found</p>
			) : (
				<div className={styles.accountsGrid}>
					{accounts.map((account) => (
						<div key={account.username} className={styles.accountCard}>
							<div className={styles.accountHeader}>
								<h3 className={styles.accountUsername}>{account.username}</h3>
								{account.role && (
									<span className={styles.roleBadge}>{account.role}</span>
								)}
							</div>
							{account.email && (
								<p className={styles.accountEmail}>{account.email}</p>
							)}
							{account.createdAt && (
								<p className={styles.accountDate}>
									Created: {new Date(account.createdAt).toLocaleDateString()}
								</p>
							)}
						</div>
					))}
				</div>
			)}
		</div>
	);
}

