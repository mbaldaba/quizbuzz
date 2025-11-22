import React from "react";
import { ActiveRoomEnum, IActiveRoom } from "../../common/types";
import styles from "./RoomList.module.scss";

type RoomListProps = {
	rooms: IActiveRoom[];
	onRoomClick: (room: IActiveRoom) => void;
	onStartRoom?: (roomId: number) => void;
	onEndRoom?: (roomId: number) => void;
	onEditRoom?: (room: IActiveRoom) => void;
	onDeleteRoom?: (roomId: number) => void;
};

export default function RoomList({
	rooms,
	onRoomClick,
	onStartRoom,
	onEndRoom,
	onEditRoom,
	onDeleteRoom,
}: RoomListProps) {
	return (
		<div className={styles.roomList}>
			{rooms.length === 0 && (
				<p className={styles.roomListEmpty}>
					No rooms created yet. Create your first quiz room to get started.
				</p>
			)}

			{rooms.map((room) => (
				<div key={room.id} className={styles.roomItem}>
					<div className={styles.roomContent}>
						<button
							type="button"
							onClick={() => onRoomClick(room)}
							className={styles.roomInfo}
						>
							<p className={styles.roomTitle}>
								{room.title}
							</p>
							<p className={styles.roomMeta}>
								Room number:{" "}
								<span className={styles.roomNumber}>
									{room.roomNumber}
								</span>
							</p>
							{room.requiresPassword && room.password && (
								<p className={styles.roomMeta}>
									Password:{" "}
									<span className={styles.roomNumber}>
										{room.password}
									</span>
								</p>
							)}
						</button>

						<div className={styles.roomActions}>
							<div className={styles.roomStatusGroup}>
								<span
									className={`${styles.statusBadge} ${
										room.status === ActiveRoomEnum.WAITING
											? styles.statusWaiting
											: room.status === ActiveRoomEnum.ONGOING
											? styles.statusOngoing
											: styles.statusEnded
									}`}
								>
									{room.status}
								</span>
								<span className={styles.roomPlayers}>
									{room.players}
									{typeof room.maxPlayers === "number"
										? ` / ${room.maxPlayers}`
										: ""}{" "}
									players
								</span>
							</div>
							<div className={styles.roomButtons}>
								<div className={styles.buttonGroup}>
									{room.status === ActiveRoomEnum.WAITING && onStartRoom && (
										<button
											type="button"
											onClick={(e) => {
												e.stopPropagation();
												onStartRoom(room.id);
											}}
											className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSmall} ${styles.whitespaceNowrap}`}
										>
											Start
										</button>
									)}
									{room.status === ActiveRoomEnum.ONGOING && onEndRoom && (
										<button
											type="button"
											onClick={(e) => {
												e.stopPropagation();
												onEndRoom(room.id);
											}}
											className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSmall} ${styles.whitespaceNowrap}`}
										>
											End
										</button>
									)}
								</div>
								<div className={styles.buttonGroup}>
									{onEditRoom && (
										<button
											type="button"
											onClick={(e) => {
												e.stopPropagation();
												onEditRoom(room);
											}}
											className={`${styles.btn} ${styles.btnIcon}`}
											title="Edit room"
										>
											<svg
												width="14"
												height="14"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
												/>
											</svg>
										</button>
									)}
									{onDeleteRoom && (
										<button
											type="button"
											onClick={(e) => {
												e.stopPropagation();
												if (window.confirm("Are you sure you want to delete this room?")) {
													onDeleteRoom(room.id);
												}
											}}
											className={`${styles.btn} ${styles.btnIcon}`}
											title="Delete room"
										>
											<svg
												width="14"
												height="14"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
												/>
											</svg>
										</button>
									)}
								</div>
							</div>
						</div>
					</div>
				</div>
			))}
		</div>
	);
}

