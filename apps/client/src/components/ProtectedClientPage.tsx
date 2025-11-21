import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getToken } from "../common/helpers";

const ProtectedClientPage: React.FC = () => {
	const token = getToken();

	if (!token) {
		return (
			<Navigate
				to="/"
				replace
			/>
		);
	}

	return <Outlet />;
};

export default ProtectedClientPage;
