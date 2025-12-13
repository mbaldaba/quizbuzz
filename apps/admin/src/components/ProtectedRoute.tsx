import { ReactNode } from "react";
import { useSession } from "../hooks/useAuth";
import Login from "./Login/Login";

interface ProtectedRouteProps {
	children: ReactNode;
}

/**
 * Protected route component that shows login screen if not authenticated
 * and the children if authenticated
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
	const { data: session, isLoading, isError } = useSession();

	if (isLoading) {
		return (
			<div style={{ 
				display: "flex", 
				justifyContent: "center", 
				alignItems: "center", 
				height: "100vh" 
			}}>
				<p>Loading...</p>
			</div>
		);
	}

	if (isError || !session) {
		return <Login />;
	}

	return <>{children}</>;
}
