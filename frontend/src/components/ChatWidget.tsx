import React, { useEffect, useState } from 'react';
import { FaComments, FaTimes } from 'react-icons/fa';
import { MessageInput } from './chat/MessageInput';
import { useAuth } from '../hooks/useAuth';
import { useOnlineUsersList } from '../hooks/useOnlineUsersList';
import './ChatWidget.css';


const TABS = [
  { key: 'agora', label: 'Agora' },
  { key: 'people', label: 'People' },
];


const ChatWidget = () => {

  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'agora' | 'people' | number>('agora');
  const [privateTabs, setPrivateTabs] = useState<{ id: number; name: string }[]>([]);
  const { user } = useAuth();
  console.log('Current user in ChatWidget:', user);

  const { users: onlinePeople, loading: loadingOnline, error: errorOnline } = useOnlineUsersList(user?.id ? String(user.id) : undefined);

 console.log('Online people:', onlinePeople);
  const openPrivateTab = (person: { id: number; name: string }) => {
    setPrivateTabs((tabs) => {
      if (tabs.find((t) => t.id === person.id)) return tabs;
      return [...tabs, person];
    });
    setActiveTab(person.id);
  };

  const closePrivateTab = (id: number) => {
    setPrivateTabs((tabs) => tabs.filter((t) => t.id !== id));
    setActiveTab((prev) => {
      if (prev === id) return 'agora';
      return prev;
    });
  };

  useEffect(() => {
    // Optionally, poll or use websockets for live updates
  }, []);

  const renderTabContent = () => {
    if (activeTab === 'agora') {
      return (
        <div className="chat-tab-content">
          <div className="chat-messages">Agora Room Conversation...</div>
          <MessageInput onSend={() => {}} disabled={false} />
        </div>
      );
    }
    if (activeTab === 'people') {
      return (
        <div className="chat-list">
          <div className="chat-friends-header-separator" style={{ display: 'flex', alignItems: 'center', gap: '0.5em', margin: '0.5em 0' }}>
            <h3 className="chat-friends-header text-xs uppercase">Online Players</h3>
            <hr style={{ flex: 1, border: 0, borderTop: '1px solid #ccc', margin: 0 }} />
          </div>
          {loadingOnline && <div>Loading online users...</div>}
          {errorOnline && <div>Error: {errorOnline}</div>}
          {onlinePeople.map(person => (
            <div key={person.id}>
              <div
                className="chat-list-item"
                onClick={() => openPrivateTab({ id: Number(person.id), name: person.username })}
              >
                {person.username}
              </div>
            </div>
          ))}
        </div>
      );
    }
    // Private tab
    const user = privateTabs.find(t => t.id === activeTab);
    if (user) {
      return (
        <div className="chat-tab-content">
          <div className="chat-header">
            {user.name}
          </div>
          <div className="chat-messages">Conversation with {user.name}...</div>
          <MessageInput onSend={() => {}} disabled={false} />
        </div>
      );
    }
    return null;
  };


  return (
    <div className={`chat-widget ${expanded ? 'expanded' : ''}`} style={{ background: 'var(--color-surface)' }}>
      {expanded ? (
        <div className="chat-container">
          <div className="chat-tabs" style={{ display: 'flex', alignItems: 'center' }}>
            {TABS.map(tab => (
              <button
                key={tab.key}
                className={`chat-tab-btn${activeTab === tab.key ? ' active' : ''}`}
                onClick={() => setActiveTab(tab.key as 'agora' | 'people')}
              >
                {tab.label}
              </button>
            ))}
        </div>
        <div className="user-tabs flex flex-wrap w-full min-w-0 gap-1">
            {privateTabs.map(tab => (
              <button
                key={tab.id}
                className={`chat-tab-btn${activeTab === tab.id ? ' active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                style={{ display: 'flex', alignItems: 'center' }}
              >
                {tab.name}
                <span style={{ marginLeft: 6 }}>
                  <FaTimes onClick={e => { e.stopPropagation(); closePrivateTab(tab.id); }} style={{ cursor: 'pointer' }} />
                </span>
              </button>
            ))}
          </div>
          <div className="chat-content">{renderTabContent()}</div>
        </div>
      ) : (
        <button className="chat-expand-btn" onClick={() => setExpanded(true)}>
          <FaComments size={28} />
        </button>
      )}
    </div>
  );
};

export default ChatWidget;
