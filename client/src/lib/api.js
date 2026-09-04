import axios from "axios";

/** Render backend in production; empty in local dev so Vite's /api proxy is used. */
export const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

axios.defaults.baseURL = API_BASE;
axios.defaults.withCredentials = true;

// Automatically attach Bearer token to all Axios requests
axios.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem("token");
		if (token && !config.headers.Authorization) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => Promise.reject(error)
);

const originalFetch = window.fetch.bind(window);

window.fetch = (input, init = {}) => {
	const url = typeof input === "string" ? input : input instanceof Request ? input.url : String(input);
	const isRelativeApi = typeof input === "string" && (input === "/api" || input.startsWith("/api/") || input.startsWith("/api?"));
	const isBaseApi = API_BASE && typeof input === "string" && input.startsWith(API_BASE);

	if (isRelativeApi || isBaseApi) {
		const targetUrl = isRelativeApi ? `${API_BASE}${input}` : url;
		const headers = new Headers(init.headers || {});
		const token = localStorage.getItem("token");
		if (token && !headers.has("Authorization")) {
			headers.set("Authorization", `Bearer ${token}`);
		}

		return originalFetch(targetUrl, {
			...init,
			headers,
			credentials: init.credentials ?? "include",
		});
	}

	return originalFetch(input, init);
};
