import React, { useState } from 'react';
import '../styles/chat.css';

export default function Chat() {
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [message, setMessage] = useState("");
  const [newParticipants, setNewParticipants] = useState([]);
  const [participantInput, setParticipantInput] = useState('');

  // 새 참가자 추가
  const handleAddParticipant = () => {
    if (participantInput && !newParticipants.includes(participantInput)) {
      setNewParticipants(prev => [...prev, participantInput]);
      setParticipantInput('');
    }
  };

  // 새 대화방 생성
  const handleCreateConversation = () => {
    if (newParticipants.length > 0) {
      const newConversationId = conversations.length + 1; // 간단한 ID 생성 로직
      const newConversation = {
        id: `conversation_${newConversationId}`,
        participants: newParticipants,
        messages: [],
      };
      setConversations(prev => [...prev, newConversation]);
      setNewParticipants([]);
      setSelectedChatId(newConversation.id);
    }
  };

  // 메시지 전송
  const handleSendMessage = () => {
    if (message.trim() && selectedChatId) {
      // 해당 대화방 찾기
      const updatedConversations = conversations.map(conv => {
        if (conv.id === selectedChatId) {
          return {
            ...conv,
            messages: [...conv.messages, { message, sender: '현재 사용자', timestamp: new Date().toISOString() }],
          };
        }
        return conv;
      });
      setConversations(updatedConversations);
      setMessage('');
    }
  };

  return (
    <div className="app-container">
      <div className="chat-list">
        <div>
          <input
            type="text"
            placeholder="참가자 ID 입력"
            value={participantInput}
            onChange={(e) => setParticipantInput(e.target.value)}
          />
          <button onClick={handleAddParticipant}>참가자 추가</button>
        </div>
        {newParticipants.length > 0 && (
          <>
            <div>추가된 참가자: {newParticipants.join(', ')}</div>
            <button onClick={handleCreateConversation}>채팅 시작하기</button>
          </>
        )}
        {conversations.map(conv => (
          <div
            key={conv.id}
            className={`chat-list-item ${selectedChatId === conv.id ? 'selected' : ''}`}
            onClick={() => setSelectedChatId(conv.id)}
          >
            {conv.participants.join(', ')}
          </div>
        ))}
      </div>
      <div className="chat-messages">
        {selectedChatId && (
          <>
            <h2>대화방: {conversations.find(conv => conv.id === selectedChatId)?.participants.join(', ')}</h2>
            <div className="messages">
              {conversations.find(conv => conv.id === selectedChatId)?.messages.map((msg, index) => (
                <div key={index} className="message">
                  {`${msg.sender}: ${msg.message} (${new Date(msg.timestamp).toLocaleTimeString()})`}
                </div>
              ))}
            </div>
            <div className="message-input-container">
              <input
                type="text"
                placeholder="메시지를 입력하세요"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button onClick={handleSendMessage}>전송</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
