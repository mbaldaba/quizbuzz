// src/modules/socket/roomSocket.ts
import { io, Socket } from "socket.io-client";
import {
	ClientToServerEvents,
	ServerToClientEvents,
	SOCKET_EVENTS,
	JoinRoomPayload,
	LeaveRoomPayload,
	SubmitAnswerPayload,
} from "@/common/types";

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

export function getRoomSocket() {
	return socket;
}

export function connectRoomSocket(baseUrl: string) {
	if (socket) return socket;

	socket = io(baseUrl, {
		transports: ["websocket"], // force ws (optional)
		withCredentials: true,
	});

	return socket;
}

export function disconnectRoomSocket() {
	if (!socket) return;
	socket.removeAllListeners();
	socket.disconnect();
	socket = null;
}

export function emitJoinRoom(payload: JoinRoomPayload) {
	socket?.emit(SOCKET_EVENTS.JOIN_ROOM, payload);
}

export function emitLeaveRoom(payload: LeaveRoomPayload) {
	socket?.emit(SOCKET_EVENTS.LEAVE_ROOM, payload);
}

export function emitSubmitAnswer(payload: SubmitAnswerPayload) {
	socket?.emit(SOCKET_EVENTS.SUBMIT_ANSWER, payload);
}
