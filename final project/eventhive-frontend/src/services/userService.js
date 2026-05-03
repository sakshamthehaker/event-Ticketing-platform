import apiClient from "./apiClient";

export const getMyProfileRequest = () => apiClient.get("/users/me");
