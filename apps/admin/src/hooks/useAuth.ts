import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { login, getSession, logout, type SessionResponse } from "../common/api";

// Query keys for React Query
export const authKeys = {
	all: ["auth"] as const,
	session: () => [...authKeys.all, "session"] as const,
};

/**
 * Hook to get the current session
 * Uses React Query to cache and manage session state
 */
export function useSession() {
	return useQuery({
		queryKey: authKeys.session(),
		queryFn: getSession,
		retry: false,
		staleTime: 1000 * 60 * 5, // 5 minutes
		refetchOnWindowFocus: true,
	});
}

/**
 * Hook to check if user is authenticated
 * Returns true if session exists and is valid
 */
export function useIsAuthenticated() {
	const { data, isSuccess } = useSession();
	return isSuccess && !!data;
}

/**
 * Hook for login mutation
 * Handles login and invalidates session query on success
 */
export function useLogin() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ username, password }: { username: string; password: string }) =>
			login(username, password),
		onSuccess: () => {
			// Invalidate and refetch session after successful login
			queryClient.invalidateQueries({ queryKey: authKeys.session() });
			toast.success("Login successful");
		},
		onError: (error) => {
			const errorMessage = error instanceof Error ? error.message : "Login failed";
			toast.error(errorMessage);
		},
	});
}

/**
 * Hook for logout mutation
 * Clears session and invalidates queries on success or error
 * Logout should always clear local state, even if API call fails
 * Sets session to null to immediately trigger redirect to login page
 */
export function useLogout() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: logout,
		onSuccess: () => {
			// Set session query data to null immediately for instant redirect
			// This will cause ProtectedRoute to show Login component
			queryClient.setQueryData(authKeys.session(), null);
			// Cancel any in-flight queries to prevent refetch
			queryClient.cancelQueries({ queryKey: authKeys.all });
			// Remove all auth-related queries
			queryClient.removeQueries({ queryKey: authKeys.all });
			toast.success("Logged out successfully");
		},
		onError: () => {
			// Even if logout API fails, clear local state
			// This ensures logout works even with network issues
			// Set session query data to null immediately for instant redirect
			queryClient.setQueryData(authKeys.session(), null);
			// Cancel any in-flight queries to prevent refetch
			queryClient.cancelQueries({ queryKey: authKeys.all });
			// Remove all auth-related queries
			queryClient.removeQueries({ queryKey: authKeys.all });
			toast.success("Logged out successfully");
		},
	});
}
