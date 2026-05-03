import apiClient from "./apiClient";

export const getEventClustersRequest = () => apiClient.get("/ml/event-clusters");
export const getUserSegmentsRequest = () => apiClient.get("/ml/user-segments");
export const getAnomaliesRequest = () => apiClient.get("/ml/anomalies");
export const getEventRecommendationsRequest = (eventId, limit = 5) =>
  apiClient.get(`/events/${eventId}/recommendations`, { params: { limit } });
