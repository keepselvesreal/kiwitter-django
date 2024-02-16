import React, { useState, useEffect, useRef } from 'react';
import '../styles/chat.css';
import axios from 'axios'; // axios 라이브러리 임포트
import { 
  Box, 
  Button, 
  List, 
  ListItem, 
  ListItemText, 
  TextField, 
  Paper, 
  IconButton,
  Typography
} from '@mui/material';
// import DeleteIcon from '@mui/icons-material/Delete';

import { useAxiosWithJwtInterceptor } from './jwtinterceptor';

export default function Chat() {
    const [selectedChatId, setSelectedChatId] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [message, setMessage] = useState("");
    const [newParticipants, setNewParticipants] = useState([]);
    const [participantInput, setParticipantInput] = useState('');
    const [excludeParticipantInput, setExcludeParticipantInput] = useState('');
    const [error, setError] = useState('');
    const [ws, setWs] = useState(null);
    const accessToken = localStorage.getItem("access token");
    const username = localStorage.getItem("username");
    const axioInstance = useAxiosWithJwtInterceptor();

    const messagesContainerRef = useRef(null); // Keep this ref to access the messages container
  
  const bottomListRef = useRef(null); // New ref for the dummy div at the end of the messages

  // 새 메시지가 대화 목록에 추가될 때 스크롤을 맨 아래로 이동
useEffect(() => {
  const currentMessages = conversations.find(conv => conv.conversation_id?.toString() === selectedChatId)?.messages;
  if (messagesContainerRef.current && currentMessages && currentMessages.length > 0) {
    // 스크롤을 맨 아래로 이동
    messagesContainerRef.current.scrollTo({
      top: messagesContainerRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }
}, [conversations, selectedChatId]);

    // 새 대화방을 추가하는 부분 스타일
  const newConversationSectionStyle = {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    alignItems: 'center',
  };

  const chatListStyle = {
    width: '30%',
    overflowY: 'auto',
  };

  const chatWindowStyle = {
    width: '70%',
    display: 'flex',
    flexDirection: 'column',
    // justifyContent: 'space-between',
  };

  const chatMessagesStyle = {
    flexGrow: 1,
    overflowY: 'auto',
    padding: '16px',
  };

  const messageInputStyle = {
    display: 'flex',
    alignItems: 'center',
    padding: '16px',
  };
    

    // 대화 목록 가져오기
  useEffect(() => {
    const fetchConversations = async () => {
      if (username) {
        try {
          const response = await axioInstance.get('http://127.0.0.1:8000/api/conversations/', {
            headers: { 'Authorization': `Bearer ${accessToken}` },
          });
          const updatedConversations = response.data.conversations.map(conv => ({
            ...conv,
            last_message_at: conv.last_message_at || "1970-01-01T00:00:00Z" // 기본값 설정
          }));
          // last_message_at 기준으로 정렬
          updatedConversations.sort((a, b) => new Date(b.last_message_at) - new Date(a.last_message_at));
          setConversations(updatedConversations);
        } catch (error) {
          console.error('대화방 목록을 가져오는데 실패했습니다:', error);
          setError('대화방 목록을 가져오는데 실패했습니다.');
        }
      }
    };
    fetchConversations();
  }, [username, accessToken]);

  // 선택된 대화방의 메시지 가져오기
  const fetchMessages = async (chatId) => {
    try {
      const response = await axioInstance.get(`http://127.0.0.1:8000/api/conversations/${chatId}/messages/`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });
      // 선택된 대화방의 메시지만 업데이트
      setConversations(prevConversations =>
        prevConversations.map(conv => {
          if (conv.conversation_id?.toString() === chatId.toString()) {
            return { ...conv, messages: response.data || [] };
          }
          return conv;
        })
      );
    } catch (error) {
      console.error('메시지 목록을 가져오는데 실패했습니다:', error);
    }
  };

  useEffect(() => {
    if (selectedChatId) {
      fetchMessages(selectedChatId);
    }
  }, [selectedChatId, accessToken]);

  // WebSocket 연결 및 메시지 수신
  useEffect(() => {
    if (selectedChatId) {
      const newWs = new WebSocket(`ws://127.0.0.1:8000/${selectedChatId}`);
      newWs.onmessage = (event) => {
        const newMessage = JSON.parse(event.data);
        // 새 메시지를 대화 목록에 추가하고 last_message_at 업데이트
        setConversations(prevConversations => {
          return prevConversations.map(conv => {
            if (conv.conversation_id.toString() === selectedChatId.toString()) {
              const updatedConv = { 
                ...conv, 
                messages: [...conv.messages, newMessage],
                last_message_at: new Date().toISOString() // 현재 시간으로 설정
              };
              return updatedConv;
            }
            return conv;
          }).sort((a, b) => new Date(b.last_message_at) - new Date(a.last_message_at)); // 다시 정렬
        });
      };
      setWs(newWs);

      return () => {
        newWs.close();
      };
    }
  }, [selectedChatId]);

  // 메시지 전송
  const handleSendMessage = async () => {
    if (ws && ws.readyState === WebSocket.OPEN && message.trim() && selectedChatId) {
      const messageData = JSON.stringify({
        username: username,
        message: message,
      });
      ws.send(messageData);
      setMessage('');
    }
  };

  // 선택된 대화방 선택
  const handleSelectChat = (chatId) => {
    setSelectedChatId(chatId.toString());
  };
      

  // 새 참가자 추가
  const handleAddParticipant = async () => {
    console.log("handleAddParticipant 진입")
    if (participantInput && !newParticipants.includes(participantInput)) {
      try {
        // Django 로컬 주소와 포트를 추가하여 API 요청
        const response = await axioInstance.post('http://127.0.0.1:8000/api/check-user-exists/', { username: participantInput }, {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });
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

  // 직전에 추가한 참가자 제외
  const handleCancelLastAddedParticipant = () => {
    setNewParticipants(prevParticipants => prevParticipants.slice(0, prevParticipants.length - 1));
};

  // 새 대화방 생성
  const handleCreateConversation = async () => {
    console.log("handleCreateConversation 진입")
    if (newParticipants.length > 0) {
      try {
        // const user = JSON.parse(localStorage.getItem('user'));
        const response = await axioInstance.post(
          'http://127.0.0.1:8000/api/create-conversation/',
          { usernames: [...newParticipants, username] }, // 현재 사용자도 참가자로 추가
          { headers: { 'Authorization': `Bearer ${accessToken}` } }
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

  // 대화방 삭제 함수
const handleDeleteConversation = async (conversationIdToDelete) => {
  try {
    await axioInstance.delete(`http://127.0.0.1:8000/api/conversations/${conversationIdToDelete}/delete/`, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });
    // 대화방 목록에서 삭제된 대화방 제거
    setConversations(conversations.filter(conv => conv.conversation_id.toString() !== conversationIdToDelete.toString()));
    // 선택된 대화방 초기화
    if (selectedChatId === conversationIdToDelete.toString()) {
      setSelectedChatId(null);
    }
  } catch (error) {
    console.error('대화방 삭제 중 오류 발생:', error);
  }
};

// 유틸리티 함수: 날짜 문자열을 받아서 포맷팅된 날짜를 반환합니다.
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('ko-KR', {
      timeZone: 'Asia/Seoul',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
  });
  }

  // 대화방 목록을 최신 순으로 정렬하여 표시
  const sortedConversations = [...conversations] // 배열의 복사본을 만듭니다.
.sort((a, b) => {
  // 마지막 메시지의 timestamp를 비교하여 정렬합니다.
  const lastMessageA = a.messages && a.messages[a.messages.length - 1];
  const lastMessageB = b.messages && b.messages[b.messages.length - 1];
  const lastTimestampA = lastMessageA ? new Date(lastMessageA.created_at).getTime() : 0;
  const lastTimestampB = lastMessageB ? new Date(lastMessageB.created_at).getTime() : 0;

  return lastTimestampB - lastTimestampA;
});
  

return (
  <Box sx={{ display: 'flex', height: '100vh' }}>
    <Paper sx={chatListStyle}>
      <Box sx={newConversationSectionStyle}>
        <TextField
          label="참가자 ID 입력"
          variant="outlined"
          size="small"
          value={participantInput}
          onChange={(e) => setParticipantInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleAddParticipant();
            }
          }}
          fullWidth
        />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            variant="contained" 
            onClick={handleAddParticipant}
            disabled={!participantInput}
          >
            참가자 추가
          </Button>
          <Button variant="contained" onClick={handleCancelLastAddedParticipant}>
                추가 취소
          </Button>
        </Box>
        {newParticipants.length > 0 && (
          <>
            <Typography>추가된 참가자: {newParticipants.join(', ')}</Typography>
            <Button variant="contained" onClick={handleCreateConversation} sx={{ backgroundColor: 'red' }}>
              채팅 시작하기
            </Button>
          </>
        )}
        {error && <Typography color="error">{error}</Typography>}
      </Box>
      <List>
        {sortedConversations.map((conv, index) => (
          <ListItem
            key={conv.conversation_id}
            secondaryAction={
              <IconButton edge="end" onClick={() => handleDeleteConversation(conv.conversation_id)}>
                {/* <DeleteIcon /> */}
              </IconButton>
            }
            selected={selectedChatId === conv.conversation_id}
            onClick={() => handleSelectChat(conv.conversation_id)}
          >
            <ListItemText primary={conv.participants.map(p => p.username).join(', ')} />
          </ListItem>
        ))}
      </List>
    </Paper>
    
    <Box sx={chatWindowStyle}>
      <Box sx={chatMessagesStyle} ref={messagesContainerRef}>
        {selectedChatId && conversations.find(conv => conv.conversation_id?.toString() === selectedChatId) ? (
          conversations.find(conv => conv.conversation_id.toString() === selectedChatId)?.messages?.map((msg, index) => (
            <Typography key={index} >
              {`${msg.sender}: ${msg.content} (${formatDate(msg.timestamp)})`}
            </Typography>
          ))
        ) : (
          <Typography>대화를 선택해주세요.</Typography>
        )}
        <div ref={bottomListRef} />
      </Box>
      {selectedChatId && conversations.find(conv => conv.conversation_id?.toString() === selectedChatId) && (
        <Box sx={{ ...messageInputStyle, position: 'sticky', bottom: '30px', backgroundColor: 'background.paper' }}> {/* 여기에 스타일 수정 */}
          <TextField
            label="메시지를 입력하세요"
            variant="outlined"
            size="small"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage();
              }
            }}
          />
          <Button 
            variant="contained" 
            onClick={handleSendMessage}
            sx={{ ml: 1 }}
            disabled={!message}
          >
            전송
          </Button>
        </Box>
      )}
    </Box>
  </Box>
);
}

