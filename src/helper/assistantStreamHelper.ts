export type StreamChunk = {
  id?: string;
  threadId?: string;
  messageId?: string;
  role?: "user" | "assistant";
  content?: Array<{ type: "text"; text?: { value?: string } }>;
  // OpenAI puede enviar chunks con texto directo (ejemplo: '0:"Hola"')
  [key: string]: any;
};

/**
 * Procesa los chunks del stream y devuelve un mensaje estructurado.
 */
export const processAssistantStream = async (chunks: StreamChunk[]): Promise<string> => {
  let fullContent = "";

  for (const chunk of chunks) {
    try {
      // Si el chunk es un string, intentamos parsearlo como JSON
      if (typeof chunk === 'string') {
        const match = chunk.match(/^\d+:(.+)$/);
        if (match) {            
          const content = match[1];
          
          // Intenta parsear como JSON para metadata
          try {
            const jsonContent = JSON.parse(content);
            console.log("jsonContent",jsonContent);
            if (jsonContent.threadId || jsonContent.messageId || jsonContent.id) {
                console.log("jsonContent.threadId",jsonContent.threadId);
            }            
            else{
                const cleanContent = content.replace(/^"|"$/g, '');
                fullContent += cleanContent;
            }
          } catch {
            // Si no es JSON válido, es contenido de texto
            // Removemos las comillas del inicio y final si existen
            console.log("content",content);
            const cleanContent = content.replace(/^"|"$/g, '');
            fullContent += cleanContent;
          }
        }
      } else {
        console.log("chunk es un objeto");
        // Procesa objetos StreamChunk normales
        if (chunk.threadId) threadId = chunk.threadId;
        if (chunk.messageId) messageId = chunk.messageId;
        if (chunk.role) role = chunk.role;

        if (chunk.content) {
          chunk.content.forEach((item) => {
            if (item.type === "text" && item.text?.value) {
              fullContent += item.text.value;
            }
          });
        }
      }
    } catch (error) {
      console.error("Error processing chunk:", error);
    }
  }

  return fullContent;
};
