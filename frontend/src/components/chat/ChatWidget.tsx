import React, { useEffect, useState } from 'react';
import { FaComments, FaTimes } from 'react-icons/fa';
import { MessageInput } from './MessageInput';
import { useAuth } from '../../hooks/useAuth';
import UsersList from './OnlineUsersList';
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

  // const { users: onlinePeople, loading: loadingOnline, error: errorOnline } = useOnlineUsersList(user?.id ? String(user.id) : undefined);

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
        <UsersList
          onUserClick={(user) => openPrivateTab({ id: Number(user.id), name: user.username })}
          currentUserId={user?.id ? String(user.id) : ''}
        />
      );
    }
    // Private tab
    const privateUser = privateTabs.find(t => t.id === activeTab);
    if (privateUser) {
      return (
        <div className="chat-tab-content">
          <div className="chat-header">
            {privateUser.name}
          </div>
          <div className="chat-messages">Conversation with {privateUser.name}...</div>
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
