export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4242/api";

// Socket.IO connects to the base URL without the /api path
// Socket.IO treats path segments as namespaces, so we need to strip /api
export const SOCKET_URL = API_URL.replace(/\/api\/?$/, '') || "http://localhost:4242";
