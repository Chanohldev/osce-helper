import { createThread, sendChatMessage } from "../providers/api";
import { API_URL } from "../config/api.config";
import { authService } from "./authService";
export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

class ChatService {
  private static instance: ChatService;
  private conversations: Conversation[] = [];
  private currentConversationId: string | null = null;

  private constructor() {
    // Cargar la última conversación por defecto
    if (this.conversations.length > 0) {
      this.currentConversationId = this.conversations[0].id;
    }
  }

  static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  async getConversations(): Promise<Conversation[]> {
    const response = await fetch(`${API_URL}/threads`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authService.getCurrentUser()?.token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Error al obtener las conversaciones");
    }

    const threads = await response.json();
    console.log(threads);
    this.conversations = threads.map((a: any) => {
      return {
        id: a.threadId,
        title: a.title,
        messages: [],
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
      };
    });
    console.log("getConversations", this.conversations);
    return this.conversations;
  }

  getCurrentConversation(): Conversation | null {
    if (!this.currentConversationId) {
      return null;
    }
    return (
      this.conversations.find(
        (conv) => conv.id === this.currentConversationId
      ) || null
    );
  }

  setCurrentConversation(conversationId: string): void {
    if (this.conversations.some((conv) => conv.id === conversationId)) {
      this.currentConversationId = conversationId;
    }
    console.log("setCurrentConversation", conversationId, this.currentConversationId);
  }

  async createNewConversation(
    title: string = "Nueva conversación"
  ): Promise<Conversation> {
    const newConversation: Conversation = {
      id: new Date().getTime().toString(),
      title,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.conversations.push(newConversation);
    this.currentConversationId = newConversation.id;

    return newConversation;
  }

  async sendMessage(content: string): Promise<Message> {
    if (!this.currentConversationId) {
      const title = content.split(" ")[0];
      const description = content.split(" ").slice(1).join(" ");  
      const thread = await createThread(
        title,
        description
      );

      if (!thread.id) {
        throw new Error("No se pudo crear el hilo de conversación");
      }

      const newConversation: Conversation = {
        id: thread?.id,
        title,
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
  
      newConversation.messages.push({
        id: `${newConversation.id}-${newConversation.messages.length + 1}`,
        content: "Hola, ¿cómo puedo ayudarte?",
        role: "assistant",
        timestamp: new Date(),
      });
      this.conversations.push(newConversation);
      this.currentConversationId = newConversation.id;
    }

    const conversation = this.conversations.find(
      (conv) => conv.id === this.currentConversationId
    );
    if (!conversation) {
      throw new Error("Conversación no encontrada");
    }

    // Crear mensaje del usuario
    const userMessage: Message = {
      id: `${conversation.id}-${conversation.messages.length + 1}`,
      content,
      role: "user",
      timestamp: new Date(),
    };

    // Añadir mensaje del usuario a la conversación
    conversation.messages.push(userMessage);
    conversation.updatedAt = new Date();

    const response = await sendChatMessage(this.currentConversationId, content);
    console.log("response", response);
    const assistantMessage: Message = {
      id: `${conversation.id}-${conversation.messages.length + 1}`,
      content: response,
      role: "assistant",
      timestamp: new Date(),
    };

    conversation.messages.push(assistantMessage);
    conversation.updatedAt = new Date();

    return userMessage;
  }

  deleteConversation(conversationId: string): void {
    this.conversations = this.conversations.filter(
      (conv) => conv.id !== conversationId
    );

    // Si se eliminó la conversación actual, seleccionar la primera disponible
    if (this.currentConversationId === conversationId) {
      this.currentConversationId =
        this.conversations.length > 0 ? this.conversations[0].id : null;
    }
  }

  renameConversation(conversationId: string, newTitle: string): void {
    const conversation = this.conversations.find(
      (conv) => conv.id === conversationId
    );
    if (conversation) {
      conversation.title = newTitle;
      conversation.updatedAt = new Date();
    }
  }
}

export const chatService = ChatService.getInstance();
