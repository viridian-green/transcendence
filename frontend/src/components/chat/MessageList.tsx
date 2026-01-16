export type ChatRenderMessage = 
  | { kind: 'chat'; username: string; text: string }
  | { kind: 'system'; text: string };

export function MessageList({
  messages,
  currentUsername,
}: {
  messages: ChatRenderMessage[];
  currentUsername?: string;
}) {
  return (
    <div className="messages">
      {messages.map((msg, i) => (
        <div key={i} className="message">
          {msg.kind === 'chat' ? (
            <>
              <strong
                className={`font-semibold ${
                  msg.username === currentUsername ? 'text-fuchsia-600' : 'text-blue-600'
                }`}
              >
                {msg.username}:
              </strong>{' '}
              <span>{msg.text}</span>
            </>
          ) : (
            <span className="text-gray-500">{msg.text}</span>
          )}
        </div>
      ))}
    </div>
  );
}