import React, { useState, useEffect } from "react";
import { useLogin } from "../../hooks/useAuth";
import styles from "./Login.module.scss";

export default function Login() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [localError, setLocalError] = useState("");

	const loginMutation = useLogin();

	// Clear local error when mutation state changes
	useEffect(() => {
		if (loginMutation.isError) {
			setLocalError(
				loginMutation.error instanceof Error
					? loginMutation.error.message
					: "Login failed. Please try again."
			);
		} else {
			setLocalError("");
		}
	}, [loginMutation.isError, loginMutation.error]);

	// Clear form fields on successful login
	useEffect(() => {
		if (loginMutation.isSuccess) {
			setUsername("");
			setPassword("");
		}
	}, [loginMutation.isSuccess]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLocalError("");

		if (!username.trim()) {
			setLocalError("Please enter your username.");
			return;
		}

		if (!password.trim()) {
			setLocalError("Please enter your password.");
			return;
		}

		loginMutation.mutate({
			username: username.trim(),
			password,
		});
	};

	const displayError = localError;
	const isLoading = loginMutation.isPending;

	return (
		<div className={styles.loginContainer}>
			<div className={styles.loginCard}>
				<div className={styles.loginHeader}>
					<p className={styles.loginLabel}>QuizzBuzz Admin</p>
					<h1 className={styles.loginTitle}>Welcome Back</h1>
					<p className={styles.loginSubtitle}>
						Sign in to access the Quiz Master Dashboard
					</p>
				</div>

				<form onSubmit={handleSubmit} className={styles.loginForm}>
					<div className={styles.formGroup}>
						<label htmlFor="username" className={styles.formLabel}>
							Username
						</label>
						<input
							id="username"
							type="text"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							placeholder="Enter your username"
							className={styles.formInput}
							autoComplete="username"
						/>
					</div>

					<div className={styles.formGroup}>
						<label htmlFor="password" className={styles.formLabel}>
							Password
						</label>
						<input
							id="password"
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="Enter your password"
							className={styles.formInput}
							autoComplete="current-password"
						/>
					</div>

					{displayError && (
						<p className={styles.formError}>{displayError}</p>
					)}

					<button
						type="submit"
						className={`${styles.btn} ${styles.btnPrimary} ${styles.btnFull}`}
						disabled={isLoading}
					>
						{isLoading ? "Signing In..." : "Sign In"}
					</button>
				</form>
			</div>
		</div>
	);
}

