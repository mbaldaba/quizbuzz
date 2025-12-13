import { useEffect, useMemo, useState } from "react";
import { Navigate, Outlet, useLocation, useParams } from "react-router-dom";
import { getParticipantToken } from "@/common/helpers";

type Props = {
	redirectTo?: string;
	requireRoomIdParam?: boolean;
	children?: React.ReactNode;
};

export default function ParticipantRoute({
	redirectTo = "/",
	requireRoomIdParam = true,
	children,
}: Props) {
	const location = useLocation();
	const { roomId } = useParams<{ roomId: string }>();

	const [loading, setLoading] = useState(true);
	const [hasToken, setHasToken] = useState(false);

	useEffect(() => {
		const token = getParticipantToken();
		setHasToken(!!token);
		setLoading(false);
	}, []);

	const missingRoomId = useMemo(() => {
		if (!requireRoomIdParam) return false;
		return !roomId || roomId.trim().length === 0;
	}, [requireRoomIdParam, roomId]);

	if (loading) {
		return (
			<div className="min-h-[40vh] w-full flex items-center justify-center">
				<div className="flex items-center gap-3 rounded-xl border border-slate-200/10 bg-slate-900/40 px-4 py-3 text-slate-200">
					<span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-transparent" />
					<span className="text-sm">Checking access...</span>
				</div>
			</div>
		);
	}

	// If no participant token, send them back to join page
	if (!hasToken) {
		return (
			<Navigate
				to={redirectTo}
				replace
				state={{ from: location }}
			/>
		);
	}

	// Optional: require /room/:roomId to exist
	if (missingRoomId) {
		return (
			<Navigate
				to={redirectTo}
				replace
			/>
		);
	}

	return <>{children ? children : <Outlet />}</>;
}
