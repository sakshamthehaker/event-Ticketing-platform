import apiClient from "./apiClient";

export const createBookingRequest = (payload) => apiClient.post("/bookings", payload);
export const listMyBookingsRequest = (params) => apiClient.get("/bookings/me", { params });
export const cancelBookingRequest = (bookingId) => apiClient.patch(`/bookings/${bookingId}/cancel`);
export const listAllBookingsRequest = (params) => apiClient.get("/bookings", { params });
