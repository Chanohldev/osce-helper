import { API_URL } from "../config/api.config";
import { authService } from "../services/authService";

type ThreadResponse = {
  id: string;
  createdAt: string;
  metadata: Record<string, any>;
};

export const createThread = async (
  title: string,
  description: string
): Promise<ThreadResponse> => {
  try {
    const response = await fetch(`${API_URL}/threads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authService.getCurrentUser()?.token}`,
      },
      body: JSON.stringify({
        title,
        description,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating thread:", error);
    throw error;
  }
};

export const sendChatMessage = async (
  threadId: string,
  message: string
): Promise<string> => {
  try {
    const response = await fetch(`${API_URL}/question`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authService.getCurrentUser()?.token}`,
      },
      body: JSON.stringify({
        threadId,
        question: message,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const text = await response.json();
    console.log("text", text);
    /*return await processAssistantStream(
      text.split("\n") as unknown as StreamChunk[]
    );*/
    return text.message;
  } catch (error) {
    console.error("Error sending chat message:", error);
    throw error;
  }
};
