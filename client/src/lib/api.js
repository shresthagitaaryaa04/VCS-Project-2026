import axios from "axios";

/** Render backend in production; empty in local dev so Vite's /api proxy is used. */
export const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

axios.defaults.baseURL = API_BASE;
axios.defaults.withCredentials = true;

const originalFetch = window.fetch.bind(window);

window.fetch = (input, init = {}) => {
	const url = typeof input === "string" ? input : input instanceof Request ? input.url : String(input);
	const isRelativeApi = typeof input === "string" && (input === "/api" || input.startsWith("/api/") || input.startsWith("/api?"));

	if (isRelativeApi) {
		return originalFetch(`${API_BASE}${input}`, {
			...init,
			credentials: init.credentials ?? "include",
		});
	}

	return originalFetch(input, init);
};
