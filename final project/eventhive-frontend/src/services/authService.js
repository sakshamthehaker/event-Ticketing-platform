import apiClient from "./apiClient";

export const registerRequest = (payload) => apiClient.post("/auth/register", payload);
export const loginRequest = (payload) => apiClient.post("/auth/login", payload);
export const logoutRequest = () => apiClient.post("/auth/logout");
