import React, { useState, useEffect } from 'react';
import '../styles/chat.css';
import axios from 'axios'; // axios 라이브러리 임포트

export default function Chat() {
    const [selectedChatId, setSelectedChatId] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [message, setMessage] = useState("");
    const [newParticipants, setNewParticipants] = useState([]);
    const [participantInput, setParticipantInput] = useState('');
    const [error, setError] = useState('');
    const [ws, setWs] = useState(null);

    useEffect(() => {
        const fetchConversations = async () => {
          console.log("fetchConversations 진입")
          const user = JSON.parse(localStorage.getItem('user'));
          if (user && user.token) {
            try {
              const response = await axios.get('http://127.0.0.1:8000/api/conversations/', {
                headers: { Authorization: `Token ${user.token}` },
              });
              // 대화방 목록을 상태에 저장합니다.
              console.log("fetchConversations response : ", response)
              setConversations(response.data.conversations);
            } catch (error) {
              console.error('대화방 목록을 가져오는데 실패했습니다:', error);
              setError('대화방 목록을 가져오는데 실패했습니다.');
            }
          }
        };
        
        fetchConversations();
      }, []);

    const fetchMessages = async (chatId) => {
      console.log("fetchMessages 진입")
      console.log("chatId : ", chatId)
      const user = JSON.parse(localStorage.getItem('user'));
      try {
        // 메시지 목록을 가져오는 API 호출
        const response = await axios.get(`http://127.0.0.1:8000/api/conversations/${chatId}/messages/`, {
          headers: { Authorization: `Token ${user.token}` },
        });
        console.log("fetchMessages response : ", response)
        // 선택된 대화방의 메시지만 업데이트
        setConversations(prevConversations =>
          prevConversations.map(conv => {
            // 옵셔널 체이닝을 사용하여 conversation_id의 존재 여부를 확인합니다.
            const isCurrentConversation = conv.conversation_id?.toString() === chatId.toString();
            if (isCurrentConversation) {
              return { ...conv, messages: response.data || [] }; // response.data가 빈 배열인 경우도 처리합니다.
            }
            return conv;
          })
        );
      } catch (error) {
        console.error('메시지 목록을 가져오는데 실패했습니다:', error);
      }
    };

    // 선택된 대화방의 메시지를 가져오는 useEffect
    useEffect(() => {
      // selectedChatId가 null이 아닐 때만 fetchMessages 호출
      if (selectedChatId) {
        fetchMessages(selectedChatId);
      }
    }, [selectedChatId]);

    useEffect(() => {
        if (selectedChatId) {
          const user = JSON.parse(localStorage.getItem('user'));
          const ws = new WebSocket(`ws://127.0.0.1:8000/${selectedChatId}`);
      
          ws.onopen = () => {
            console.log('WebSocket Connected');
          };
      
          ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log('Message from WebSocket: ', data);
            if (Array.isArray(data)) {
              setConversations(prevConversations => {
                const currentConversation = prevConversations.find(conv => conv.conversation_id === selectedChatId);
                const currentMessages = currentConversation ? currentConversation.messages : [];
      
                // 이미 상태에 있는 메시지들의 created_at 값을 기반으로 하여 가장 최근 메시지를 찾습니다.
                const lastMessageDate = currentMessages.length > 0
                  ? new Date(currentMessages[currentMessages.length - 1].created_at).getTime()
                  : 0;
      
                // 새로운 메시지들만 필터링합니다.
                const newMessages = data.filter(msg => new Date(msg.created_at).getTime() > lastMessageDate);
      
                // 새로운 메시지들을 현재 대화에 추가합니다.
                const updatedConversations = prevConversations.map(conv => {
                  if (conv.conversationid === selectedChatId) {
                    // currentConversation이 undefined가 아닌지 확인합니다.
                    const currentConversation = prevConversations.find(conv => conv.conversation_id === selectedChatId) || {};
                    // currentMessages가 배열인지 확인하고, 그렇지 않다면 빈 배열을 사용합니다.
                    const currentMessages = currentConversation.messages || [];
                    return { ...conv, messages: [...currentMessages, ...newMessages] };
                  }
                  return conv;
                });
      
                return updatedConversations;
              });
            } else {
              console.log('Received data is not an array of messages:', data);
            }
          };
      
          ws.onerror = (error) => {
            console.error('WebSocket error: ', error);
          };
      
          ws.onclose = () => {
            console.log('WebSocket disconnected');
          };
      
          setWs(ws);
          return () => ws.close();
        }
      }, [selectedChatId]);
      

  // 새 참가자 추가
  const handleAddParticipant = async () => {
    console.log("handleAddParticipant 진입")
    if (participantInput && !newParticipants.includes(participantInput)) {
      try {
        // Django 로컬 주소와 포트를 추가하여 API 요청
        const response = await axios.post('http://127.0.0.1:8000/api/check-user-exists/', { username: participantInput });
        if (response.data.exists) {
          setNewParticipants(prev => [...prev, participantInput]);
          setParticipantInput('');
          setError(''); // 에러 메시지 초기화
        } else {
          setError(response.data.error); // 적절한 에러 메시지 표시
        }
      } catch (error) {
        console.error('API 요청 중 에러:', error);
        setError('API 요청 중 에러가 발생했습니다.');
      }
    }
  };

  // 새 대화방 생성
  const handleCreateConversation = async () => {
    console.log("handleCreateConversation 진입")
    if (newParticipants.length > 0) {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        const response = await axios.post(
          'http://127.0.0.1:8000/api/create-conversation/',
          { usernames: [...newParticipants, user.username] }, // 현재 사용자도 참가자로 추가
          { headers: { Authorization: `Token ${user.token}` } }
        );
        console.log("handleCreateConversation response : ", response)
        const { conversation_id, participants } = response.data;
  
        // 대화방 목록에 새 대화방 추가
        const newConversation = {
          conversation_id: conversation_id.toString(),
          participants: participants, // 서버로부터 받은 participants 배열 사용
          messages: [],
        };
  
        setConversations(prev => [...prev, newConversation]);
        setSelectedChatId(conversation_id.toString()); // 새 대화방 선택
        setNewParticipants([]); // 입력된 참가자 목록 초기화
      } catch (error) {
        setError('대화방 생성에 실패했습니다.');
        console.error('대화방 생성 에러:', error.response ? error.response.data : error.message);
      }
    }
  };

  // 메시지 전송
  const handleSendMessage = () => {
  console.log("handleSendMessage 진입");
  if (ws && ws.readyState === WebSocket.OPEN && message.trim() && selectedChatId) {
    const user = JSON.parse(localStorage.getItem('user'));
    const dataToSend = JSON.stringify({
      username: user.username,
      message: message,
    });
    ws.send(dataToSend);
    setMessage('');
  }
};

const handleSelectChat = (chatId) => {
  console.log("handleSelectChat 진입");
  console.log('chatId:', chatId);
  setSelectedChatId(chatId.toString()); // 상태 업데이트
};


// 유틸리티 함수: 날짜 문자열을 받아서 포맷팅된 날짜를 반환합니다.
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleTimeString();
  }

  // 대화방 목록을 최신 순으로 정렬하여 표시
  const sortedConversations = [...conversations] // 배열의 복사본을 만듭니다.
.sort((a, b) => {
  // 마지막 메시지의 timestamp를 비교하여 정렬합니다.
  const lastMessageA = a.messages && a.messages[a.messages.length - 1];
  const lastMessageB = b.messages && b.messages[b.messages.length - 1];
  const lastTimestampA = lastMessageA ? new Date(lastMessageA.timestamp).getTime() : 0;
  const lastTimestampB = lastMessageB ? new Date(lastMessageB.timestamp).getTime() : 0;

  return lastTimestampB - lastTimestampA;
});
  

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
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
        {newParticipants.length > 0 && (
          <>
            <div>추가된 참가자: {newParticipants.join(', ')}</div>
            <button onClick={handleCreateConversation}>채팅 시작하기</button>
          </>
        )}
        {/* sortedConversations 배열을 사용하여 정렬된 목록을 렌더링 */}
        {
          sortedConversations.map((conv, index) => (
            <div
              key={index}
              className={`chat-list-item ${selectedChatId === conv.conversation_id ? 'selected' : ''}`}
              onClick={() => handleSelectChat(conv.conversation_id)}
            >
              {conv.participants.map(p => p.username).join(', ')}
            </div>
          ))
        }
      </div>
      <div className="chat-messages">
        {selectedChatId && conversations.find(conv => conv.conversation_id?.toString() === selectedChatId) ? (
          <>
            <h2>대화방: {conversations.find(conv => conv.conversation_id.toString() === selectedChatId.toString()).participants.map(p => p.username).join(', ')}</h2>
            <div className="messages">
              {conversations.find(conv => conv.conversation_id.toString() === selectedChatId)?.messages.map((msg, index) => (
                <div key={index} className="message">
                  {`${msg.sender?.username}: ${msg.content} (${formatDate(msg.timestamp)})`}
                </div>
              )) || <div>메시지가 없습니다.</div>}
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
        ) : (
          <div>대화를 선택해주세요.</div>
        )}
      </div>
    </div>
  );
}

