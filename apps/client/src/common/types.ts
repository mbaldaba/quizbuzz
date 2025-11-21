export enum ActiveRoomEnum {
  WAITING = "Waiting for players",
  ONGOING = "Ongoing",
}

export interface IActiveRoom {
	id: number,
	roomNumber: string,
	title: string,
	hostName: string,
	status: ActiveRoomEnum,
	players: number,
	maxPlayers?: number,
	requiresPassword: boolean,
}
