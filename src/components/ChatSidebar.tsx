import { useState, useEffect } from 'react';
import { chatService, Conversation } from '../services/chatService';

interface ChatSidebarProps {
  onConversationSelect: (conversationId: string) => void;
  onCreateNewConversation: () => void;
  currentConversationId: string | null;
}

export const ChatSidebar = ({ 
  onConversationSelect, 
  onCreateNewConversation, 
  currentConversationId 
}: ChatSidebarProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isRenaming, setIsRenaming] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    // Cargar conversaciones al montar el componente
    setConversations(chatService.getConversations());
  }, []);

  const handleConversationClick = (conversationId: string) => {
    onConversationSelect(conversationId);
  };

  const handleNewChatClick = () => {
    onCreateNewConversation();
  };

  const handleRenameClick = (e: React.MouseEvent, conversation: Conversation) => {
    e.stopPropagation();
    setIsRenaming(conversation.id);
    setNewTitle(conversation.title);
  };

  const handleRenameSubmit = (e: React.FormEvent, conversationId: string) => {
    e.preventDefault();
    if (newTitle.trim()) {
      chatService.renameConversation(conversationId, newTitle.trim());
      setConversations(chatService.getConversations());
    }
    setIsRenaming(null);
  };

  const handleDeleteClick = (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation();
    if (window.confirm('¿Estás seguro de que quieres eliminar esta conversación?')) {
      chatService.deleteConversation(conversationId);
      setConversations(chatService.getConversations());
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
      <div className="p-4">
        <button
          onClick={handleNewChatClick}
          className="w-full flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-md py-2 px-4 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Nueva conversación
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            No hay conversaciones. ¡Crea una nueva!
          </div>
        ) : (
          <ul className="space-y-1 p-2">
            {conversations.map((conversation) => (
              <li key={conversation.id}>
                <div
                  className={`flex items-center justify-between p-2 rounded-md cursor-pointer ${
                    currentConversationId === conversation.id
                      ? 'bg-gray-200 dark:bg-gray-700'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700/50'
                  }`}
                  onClick={() => handleConversationClick(conversation.id)}
                >
                  {isRenaming === conversation.id ? (
                    <form 
                      className="flex-1 flex items-center" 
                      onSubmit={(e) => handleRenameSubmit(e, conversation.id)}
                    >
                      <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="w-full bg-white dark:bg-gray-600 text-gray-900 dark:text-white rounded px-2 py-1 text-sm border border-gray-300 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    </form>
                  ) : (
                    <span className="truncate text-sm">{conversation.title}</span>
                  )}
                  
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={(e) => handleRenameClick(e, conversation)}
                      className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                      title="Renombrar"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => handleDeleteClick(e, conversation.id)}
                      className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                      title="Eliminar"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
          <span>ChatGPT Clone</span>
        </div>
      </div>
    </div>
  );
}; 