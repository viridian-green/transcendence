import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function Chat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<string[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!user) return; // Extra safety check

    // Connect to WebSocket through NGINX/Gateway
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/chat/websocket`;
    
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log('Connected to chat');
      setIsConnected(true);
    };

    ws.current.onmessage = (event) => {
      setMessages((prev) => [...prev, event.data]);
    };

    ws.current.onclose = () => {
      console.log('Disconnected from chat');
      setIsConnected(false);
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    // Cleanup on unmount
    return () => {
      ws.current?.close();
    };
  }, [user]);

  const sendMessage = () => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN && inputMessage.trim()) {
      ws.current.send(inputMessage);
      setInputMessage('');
    }
  };

  return (
    <div className="chat-container">
      <h1>Chat</h1>
      <div className="status">
        {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
      </div>
      
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className="message">
            <p>"Received:"</p>{msg}
          </div>
        ))}
      </div>

      <div className="input-area">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage} disabled={!isConnected}>
          Send
        </button>
      </div>
    </div>
  );
}
