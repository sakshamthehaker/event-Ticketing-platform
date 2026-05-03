import apiClient from "./apiClient";

export const listEventsRequest = (params) => apiClient.get("/events", { params });
export const listMyEventsRequest = (params) => apiClient.get("/events/mine", { params });
export const getEventRequest = (eventId) => apiClient.get(`/events/${eventId}`);
export const createEventRequest = (payload) => apiClient.post("/events", payload);
export const deleteEventRequest = (eventId) => apiClient.delete(`/events/${eventId}`);
