import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
	client,
	type RoomResponseDto,
	type CreateRoomDto,
	type PaginationMetaDto,
} from "@repo/api-client";
import { IActiveRoom, ActiveRoomEnum } from "../common/types";
import { useSession } from "./useAuth";
import { getRoomById, mapRoomFromApi as mapRoomWithQuestions } from "../common/api";

// Local type for paginated rooms response (not exported from API client)
type PaginatedRoomsResponseDto = {
	meta: PaginationMetaDto;
	data: Array<RoomResponseDto>;
};

// Query keys for React Query
export const roomKeys = {
	all: ["rooms"] as const,
	lists: () => [...roomKeys.all, "list"] as const,
	list: (params?: { perPage?: number }) => [...roomKeys.lists(), params] as const,
	details: () => [...roomKeys.all, "detail"] as const,
	detail: (id: string) => [...roomKeys.details(), id] as const,
};

/**
 * Generate a short room number from room ID
 */
function generateRoomNumberFromId(id: string): string {
	// Use first 4 characters of the ID, converting to uppercase
	// If ID is shorter, pad with random chars
	if (id.length >= 4) {
		return id.substring(0, 4).toUpperCase();
	}
	// Fallback: use a hash-like approach
	const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
	let result = id.toUpperCase().substring(0, id.length);
	while (result.length < 4) {
		result += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return result.substring(0, 4);
}

/**
 * Convert API RoomStatus to frontend ActiveRoomEnum
 */
function mapRoomStatusFromApi(status: "CREATED" | "ONGOING" | "ENDED"): ActiveRoomEnum {
	switch (status) {
		case "CREATED":
			return ActiveRoomEnum.WAITING;
		case "ONGOING":
			return ActiveRoomEnum.ONGOING;
		case "ENDED":
			return ActiveRoomEnum.ENDED;
		default:
			return ActiveRoomEnum.WAITING;
	}
}

/**
 * Convert API RoomResponseDto to frontend IActiveRoom
 */
function mapRoomFromApi(apiRoom: RoomResponseDto, hostName: string = "You"): IActiveRoom {
	return {
		id: apiRoom.id,
		roomNumber: generateRoomNumberFromId(apiRoom.id),
		title: apiRoom.title,
		hostName,
		status: mapRoomStatusFromApi(apiRoom.status),
		players: 0, // TODO: Fetch actual player count from participants API
		maxPlayers: apiRoom.maxPlayers,
		requiresPassword: apiRoom.hasPassword,
		password: null, // Password is not returned from API for security
		createdAt: apiRoom.createdAt,
	};
}

/**
 * Convert frontend room data to API CreateRoomDto
 */
function mapRoomToApiCreate(roomData: {
	title: string;
	maxPlayers?: number;
	requiresPassword: boolean;
	password?: string;
}): CreateRoomDto {
	return {
		title: roomData.title,
		maxPlayers: roomData.maxPlayers || 10, // Default to 10 if not specified
		password: roomData.requiresPassword ? roomData.password : undefined,
	};
}

/**
 * Hook to fetch rooms
 * Uses React Query to cache and manage rooms state
 */
export function useRooms(params?: { perPage?: number }) {
	const { data: session } = useSession();

	return useQuery({
		queryKey: roomKeys.list(params),
		queryFn: async () => {
			const response = await client.get<{ 200: RoomResponseDto[] | PaginatedRoomsResponseDto }>({
				url: "/rooms",
				query: { perPage: params?.perPage || 100 },
			});
			if (!response.data) {
				throw new Error("Failed to fetch rooms");
			}
			// The response might be PaginatedRoomsResponseDto or just an array
			let roomsData: RoomResponseDto[];
			if (Array.isArray(response.data)) {
				roomsData = response.data as RoomResponseDto[];
			} else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
				roomsData = (response.data as PaginatedRoomsResponseDto).data;
			} else {
				roomsData = [];
			}
			return roomsData.map((room) =>
				mapRoomFromApi(room, session?.username || "You")
			);
		},
		enabled: !!session,
		staleTime: 1000 * 30, // 30 seconds
		refetchOnWindowFocus: false,
	});
}

/**
 * Hook to fetch a single room by ID
 * Uses React Query to cache and manage room state
 */
export function useRoomById(roomId: string | null) {
	const { data: session } = useSession();

	return useQuery({
		queryKey: roomId ? roomKeys.detail(roomId) : ["rooms", "detail", "null"],
		queryFn: async () => {
			if (!roomId) {
				throw new Error("Room ID is required");
			}
			const apiRoom = await getRoomById(roomId);
			return mapRoomWithQuestions(apiRoom, session?.username || "You");
		},
		enabled: !!session && !!roomId,
		staleTime: 1000 * 5, // 5 seconds - fresher data for individual room
		refetchOnWindowFocus: false,
	});
}

/**
 * Hook for creating a room mutation
 * Handles room creation and invalidates rooms query on success
 */
export function useCreateRoom() {
	const queryClient = useQueryClient();
	const { data: session } = useSession();

	return useMutation({
		mutationFn: async (roomData: {
			title: string;
			maxPlayers?: number;
			requiresPassword: boolean;
			password?: string;
		}) => {
			const apiRoomData = mapRoomToApiCreate(roomData);
			const response = await client.post<{ 201: RoomResponseDto }>({
				url: "/rooms",
				body: apiRoomData,
			});
			if (!response.data) {
				throw new Error("Failed to create room");
			}
			return mapRoomFromApi(response.data, session?.username || "You");
		},
		onSuccess: () => {
			// Invalidate and refetch rooms after successful creation
			queryClient.invalidateQueries({ queryKey: roomKeys.all });
			toast.success("Room created successfully");
		},
		onError: (error) => {
			const errorMessage = error instanceof Error ? error.message : "Failed to create room";
			toast.error(errorMessage);
		},
	});
}

/**
 * Hook for deleting a room mutation
 * Handles room deletion and invalidates rooms query on success
 */
export function useDeleteRoom() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (roomId: string) => {
			await client.delete({
				url: "/rooms/{id}",
				path: { id: roomId },
			});
		},
		onSuccess: () => {
			// Invalidate and refetch rooms after successful deletion
			queryClient.invalidateQueries({ queryKey: roomKeys.all });
			toast.success("Room deleted successfully");
		},
		onError: (error) => {
			const errorMessage = error instanceof Error ? error.message : "Failed to delete room";
			toast.error(errorMessage);
		},
	});
}

/**
 * Hook for starting a room mutation
 * Handles room start and invalidates rooms query on success
 */
export function useStartRoom() {
	const queryClient = useQueryClient();
	const { data: session } = useSession();

	return useMutation({
		mutationFn: async (roomId: string) => {
			const response = await client.patch<{ 200: RoomResponseDto }>({
				url: "/rooms/{id}/start",
				path: { id: roomId },
			});
			if (!response.data) {
				throw new Error("Failed to start room");
			}
			return mapRoomFromApi(response.data, session?.username || "You");
		},
		onSuccess: () => {
			// Invalidate and refetch rooms after successful start
			queryClient.invalidateQueries({ queryKey: roomKeys.all });
			toast.success("Room started successfully");
		},
		onError: (error) => {
			const errorMessage = error instanceof Error ? error.message : "Failed to start room";
			toast.error(errorMessage);
		},
	});
}

/**
 * Hook for ending a room mutation
 * Handles room end and invalidates rooms query on success
 */
export function useEndRoom() {
	const queryClient = useQueryClient();
	const { data: session } = useSession();

	return useMutation({
		mutationFn: async (roomId: string) => {
			const response = await client.patch<{ 200: RoomResponseDto }>({
				url: "/rooms/{id}/end",
				path: { id: roomId },
			});
			if (!response.data) {
				throw new Error("Failed to end room");
			}
			return mapRoomFromApi(response.data, session?.username || "You");
		},
		onSuccess: () => {
			// Invalidate and refetch rooms after successful end
			queryClient.invalidateQueries({ queryKey: roomKeys.all });
			toast.success("Room ended successfully");
		},
		onError: (error) => {
			const errorMessage = error instanceof Error ? error.message : "Failed to end room";
			toast.error(errorMessage);
		},
	});
}
