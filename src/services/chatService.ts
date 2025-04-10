import { createThread, sendChatMessage } from '../providers/api';

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

// Datos mockeados para las conversaciones
const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    title: 'Introducción a React',
    messages: [
      {
        id: '1-1',
        content: '¿Qué es React y por qué es popular?',
        role: 'user',
        timestamp: new Date('2023-04-01T10:00:00')
      },
      {
        id: '1-2',
        content: 'React es una biblioteca de JavaScript para construir interfaces de usuario. Es popular por su enfoque basado en componentes, su virtual DOM que mejora el rendimiento, y su ecosistema rico con muchas herramientas y bibliotecas complementarias.',
        role: 'assistant',
        timestamp: new Date('2023-04-01T10:01:00')
      },
      {
        id: '1-3',
        content: '¿Cuáles son los conceptos principales de React?',
        role: 'user',
        timestamp: new Date('2023-04-01T10:05:00')
      },
      {
        id: '1-4',
        content: 'Los conceptos principales de React incluyen: componentes, props, estado, ciclo de vida, hooks, contexto, y el virtual DOM. Los componentes son bloques de construcción reutilizables, props permiten pasar datos entre componentes, y el estado maneja datos que cambian con el tiempo.',
        role: 'assistant',
        timestamp: new Date('2023-04-01T10:06:00')
      }
    ],
    createdAt: new Date('2023-04-01T10:00:00'),
    updatedAt: new Date('2023-04-01T10:06:00')
  },
  {
    id: '2',
    title: 'Planificación de viaje a París',
    messages: [
      {
        id: '2-1',
        content: '¿Cuáles son los mejores lugares para visitar en París?',
        role: 'user',
        timestamp: new Date('2023-04-05T14:00:00')
      },
      {
        id: '2-2',
        content: 'París tiene muchos lugares increíbles para visitar. Algunos de los más famosos incluyen la Torre Eiffel, el Louvre, la Catedral de Notre-Dame, el Arco de Triunfo, y el Palacio de Versalles. También vale la pena explorar barrios como Montmartre, Le Marais, y el Barrio Latino.',
        role: 'assistant',
        timestamp: new Date('2023-04-05T14:02:00')
      },
      {
        id: '2-3',
        content: '¿Cuál es la mejor época para visitar París?',
        role: 'user',
        timestamp: new Date('2023-04-05T14:10:00')
      },
      {
        id: '2-4',
        content: 'La primavera (abril a junio) y el otoño (septiembre a octubre) son generalmente consideradas las mejores épocas para visitar París. El clima es agradable, hay menos turistas que en verano, y los precios suelen ser más bajos. El verano puede ser muy caluroso y lleno de turistas, mientras que el invierno puede ser frío y lluvioso.',
        role: 'assistant',
        timestamp: new Date('2023-04-05T14:11:00')
      }
    ],
    createdAt: new Date('2023-04-05T14:00:00'),
    updatedAt: new Date('2023-04-05T14:11:00')
  },
  {
    id: '3',
    title: 'Recetas de cocina',
    messages: [
      {
        id: '3-1',
        content: '¿Cómo puedo hacer una pasta carbonara auténtica?',
        role: 'user',
        timestamp: new Date('2023-04-10T18:30:00')
      },
      {
        id: '3-2',
        content: 'Para una pasta carbonara auténtica, necesitarás: espaguetis, panceta o guanciale, huevos, queso pecorino romano, pimienta negra recién molida y sal. Cuece la pasta al dente. Mientras tanto, fríe la panceta hasta que esté crujiente. En un bowl, mezcla los huevos, el queso rallado y la pimienta. Cuando la pasta esté lista, escúrrela reservando un poco de agua. Mezcla la pasta caliente con la mezcla de huevo y queso, añadiendo un poco de agua de la pasta si es necesario. Sirve inmediatamente con más queso y pimienta por encima.',
        role: 'assistant',
        timestamp: new Date('2023-04-10T18:32:00')
      }
    ],
    createdAt: new Date('2023-04-10T18:30:00'),
    updatedAt: new Date('2023-04-10T18:32:00')
  }
];

class ChatService {
  private static instance: ChatService;
  private conversations: Conversation[] = MOCK_CONVERSATIONS;
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

  getConversations(): Conversation[] {
    return [...this.conversations].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  getCurrentConversation(): Conversation | null {
    if (!this.currentConversationId) {
      return null;
    }
    return this.conversations.find(conv => conv.id === this.currentConversationId) || null;
  }

  setCurrentConversation(conversationId: string): void {
    if (this.conversations.some(conv => conv.id === conversationId)) {
      this.currentConversationId = conversationId;
    }
  }

  async createNewConversation(title: string = 'Nueva conversación'): Promise<Conversation> {
    const thread = await createThread();
    if (!thread.data?.id) {
      throw new Error('No se pudo crear el hilo de conversación');
    }

    const newConversation: Conversation = {
      id: thread.data?.id,
      title,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.conversations.push(newConversation);
    this.currentConversationId = newConversation.id;
    
    return newConversation;
  }

  async sendMessage(content: string): Promise<Message> {
    if (!this.currentConversationId) {
      throw new Error('No hay una conversación activa');
    }
    
    const conversation = this.conversations.find(conv => conv.id === this.currentConversationId);
    if (!conversation) {
      throw new Error('Conversación no encontrada');
    }
    
    // Crear mensaje del usuario
    const userMessage: Message = {
      id: `${conversation.id}-${conversation.messages.length + 1}`,
      content,
      role: 'user',
      timestamp: new Date()
    };
    
    // Añadir mensaje del usuario a la conversación
    conversation.messages.push(userMessage);
    conversation.updatedAt = new Date();

    const response = await sendChatMessage(this.currentConversationId, content);
    console.log("response",response);
    const assistantMessage: Message = {
      id: `${conversation.id}-${conversation.messages.length + 1}`,
      content: response,
      role: 'assistant',
      timestamp: new Date()
    };  

    conversation.messages.push(assistantMessage);
    conversation.updatedAt = new Date();

    return userMessage;
  }

  deleteConversation(conversationId: string): void {
    this.conversations = this.conversations.filter(conv => conv.id !== conversationId);
    
    // Si se eliminó la conversación actual, seleccionar la primera disponible
    if (this.currentConversationId === conversationId) {
      this.currentConversationId = this.conversations.length > 0 ? this.conversations[0].id : null;
    }
  }

  renameConversation(conversationId: string, newTitle: string): void {
    const conversation = this.conversations.find(conv => conv.id === conversationId);
    if (conversation) {
      conversation.title = newTitle;
      conversation.updatedAt = new Date();
    }
  }
}

export const chatService = ChatService.getInstance(); 