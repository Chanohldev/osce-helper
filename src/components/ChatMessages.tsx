import { useEffect, useRef } from 'react';
import { Message } from '../services/chatService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
}

const formatMarkdown = (text: string) => {
  return text
  .replace(/\\n/g, '\n') // reemplaza "\n" como texto por saltos reales de línea
  .replace(/\[\d+:\d+†.*?\]/g, ''); // elimina referencias tipo [6:0†...]
};


export const ChatMessages = ({ messages, isLoading }: ChatMessagesProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <h3 className="text-xl font-medium mb-2">Bienvenido a ChatGPT Clone</h3>
          <p className="text-center max-w-md">
            Este es un clon de la interfaz de ChatGPT. Puedes crear nuevas conversaciones, enviar mensajes y recibir respuestas simuladas.
          </p>
        </div>
      ) : (
        messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
              }`}
            >
              <div className="whitespace-pre-wrap text-left">
                <ReactMarkdown 
                remarkPlugins={[remarkGfm]} 
                rehypePlugins={[rehypeSanitize]}
                components={{
                  h3: ({ node, ...props }) => <h3 className="text-lg font-semibold mt-4 mb-2" {...props} />,
                  ul: ({ node, ...props }) => <ul className="list-disc pl-5 space-y-1" {...props} />,
                  a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" />,
                  code: ({ node, ...props }) => (
                    <code className="bg-gray-100 p-1 rounded" {...props} />
                  ),
                  table: ({ node, ...props }) => (
                    <table className="border-collapse border border-gray-300" {...props} />
                  )
                }}
                >
                  {formatMarkdown(message.content)}
                </ReactMarkdown></div>
              <div className="text-xs mt-2 opacity-70">
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          </div>
        ))
      )}

      {isLoading && (
        <div className="flex justify-start">
          <div className="max-w-[80%] rounded-lg p-4 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}; 