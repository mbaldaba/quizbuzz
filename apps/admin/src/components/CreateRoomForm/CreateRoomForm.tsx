import React, { useState } from "react";
import styles from "./CreateRoomForm.module.scss";

type CreateRoomFormProps = {
	onCreate: (roomData: {
		title: string;
		maxPlayers?: number;
		requiresPassword: boolean;
		password?: string;
	}) => void;
};

export default function CreateRoomForm({ 
	onCreate
}: CreateRoomFormProps) {
	const [title, setTitle] = useState("");
	const [maxPlayers, setMaxPlayers] = useState<number | "">("");
	const [requiresPassword, setRequiresPassword] = useState(true);
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		if (!title.trim()) {
			setError("Please enter a room title.");
			return;
		}

		if (requiresPassword && !password.trim()) {
			setError("Please enter a password for the room.");
			return;
		}

		const roomData = {
			title: title.trim(),
			maxPlayers: maxPlayers === "" ? undefined : Number(maxPlayers),
			requiresPassword,
			password: requiresPassword ? password.trim() : undefined,
		};

		onCreate(roomData);

		// Reset form
		setTitle("");
		setMaxPlayers("");
		setRequiresPassword(true);
		setPassword("");
	};

	return (
		<form onSubmit={handleSubmit} className={styles.spaceY3}>
			<div className={styles.formGroup}>
				<label htmlFor="title" className={styles.formLabel}>
					Room Title
				</label>
				<input
					id="title"
					type="text"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					placeholder="e.g., Science Quiz Bee Finals"
					className={styles.formInput}
				/>
			</div>

			<div className={styles.formGroup}>
				<label htmlFor="maxPlayers" className={styles.formLabel}>
					Max Players (Optional)
				</label>
				<input
					id="maxPlayers"
					type="number"
					min="1"
					value={maxPlayers}
					onChange={(e) =>
						setMaxPlayers(e.target.value === "" ? "" : Number(e.target.value))
					}
					placeholder="No limit"
					className={styles.formInput}
				/>
			</div>

			<div className={`${styles.formGroup} ${styles.flex} ${styles.itemsCenter} ${styles.gap2}`}>
				<input
					id="requiresPassword"
					type="checkbox"
					checked={requiresPassword}
					onChange={(e) => setRequiresPassword(e.target.checked)}
					className={styles.formCheckbox}
				/>
				<label htmlFor="requiresPassword" className={`${styles.formLabel} ${styles.mb0}`}>
					Require password to join
				</label>
			</div>

			{requiresPassword && (
				<div className={styles.formGroup}>
					<label htmlFor="password" className={styles.formLabel}>
						Room Password
					</label>
					<input
						id="password"
						type="text"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						placeholder="Enter room password"
						className={styles.formInput}
					/>
				</div>
			)}

			{error && (
				<p className={styles.formError}>
					{error}
				</p>
			)}

			<div className={styles.formActions}>
				<button
					type="submit"
					className={`${styles.btn} ${styles.btnPrimary} ${styles.btnFull}`}
				>
					Create Room
				</button>
			</div>
		</form>
	);
}

