import api from "./apiClient";

export const sendMessageToBot = async (message, history) => {
  const response = await api.post("/chat", { message, history }, { timeout: 60000 });
  return response.data.data.reply;
};
