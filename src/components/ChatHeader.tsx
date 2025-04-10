import { useState } from 'react';
import { Conversation } from '../services/chatService';

interface ChatHeaderProps {
  conversation: Conversation | null;
  onToggleSidebar: () => void;
}

export const ChatHeader = ({ conversation, onToggleSidebar }: ChatHeaderProps) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState(conversation?.title || '');

  const handleRenameClick = () => {
    setIsRenaming(true);
    setNewTitle(conversation?.title || '');
  };

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle.trim() && conversation) {
      // Aquí se implementaría la lógica para renombrar la conversación
      console.log('Renombrar conversación a:', newTitle);
    }
    setIsRenaming(false);
  };

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
      <div className="flex items-center">
        <button
          onClick={onToggleSidebar}
          className="mr-4 p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        {isRenaming ? (
          <form onSubmit={handleRenameSubmit} className="flex items-center">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </form>
        ) : (
          <h1 className="text-lg font-medium">
            {conversation?.title || 'Nueva conversación'}
          </h1>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        {!isRenaming && conversation && (
          <button
            onClick={handleRenameClick}
            className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
            title="Renombrar conversación"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
        )}
        
        <button
          className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
          title="Más opciones"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
      </div>
    </div>
  );
}; 