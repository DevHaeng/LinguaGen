import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';

const ChatInsetContent = ({
                            activeRoomId,
                            chatRooms,
                            addNewChatRoom,
                            sendMessage
                          }) => {
  const [typingText, setTypingText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const prevMessagesLengthRef = useRef({});

  // 자동 스크롤 함수
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 타이핑 애니메이션 효과
  const typeMessage = (message, index = 0) => {
    if (index <= message.length) {
      setTypingText(message.slice(0, index));
      setTimeout(() => {
        typeMessage(message, index + 1);
      }, 5); // 타이핑 속도 조절
    } else {
      setIsTyping(false);
    }
  };

  // 새 메시지가 추가될 때마다 스크롤
  useEffect(() => {
    scrollToBottom();
  }, [chatRooms, typingText]);

  // 채팅방 변경 시 타이핑 상태 초기화
  useEffect(() => {
    setIsTyping(false);
    setTypingText('');
  }, [activeRoomId]);

  // 새 메시지 감지 및 타이핑 애니메이션
  useEffect(() => {
    const currentMessages = chatRooms[activeRoomId];
    if (!currentMessages) return;

    const currentLength = currentMessages.length;
    const prevLength = prevMessagesLengthRef.current[activeRoomId] || 0;

    // 새 메시지가 추가되었고, 그것이 봇의 메시지인 경우에만 타이핑 애니메이션 시작
    if (currentLength > prevLength &&
        currentMessages[currentLength - 1].sender === 'bot') {
      setIsTyping(true);
      setTypingText('');
      typeMessage(currentMessages[currentLength - 1].text);
    }

    // 현재 메시지 수 업데이트
    prevMessagesLengthRef.current[activeRoomId] = currentLength;
  }, [chatRooms, activeRoomId]);

  return (
      <div className="flex flex-col h-full p-4 overflow-y-auto custom-scrollbar">
        <div className="flex flex-col flex-1 rounded-lg bg-white shadow-sm">
          {/* 채팅 헤더 */}
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold">{activeRoomId}</h3>
            <Button
                variant="ghost"
                size="sm"
                onClick={addNewChatRoom}
                className="text-muted-foreground"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Chat
            </Button>
          </div>

          {/* 채팅 메시지 영역 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatRooms[activeRoomId]?.map((message, index) => (
                <div
                    key={index}
                    className={`flex ${
                        message.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                >
                  <div className="flex flex-col max-w-[80%]">
                    <div
                        className={`inline-block rounded-lg p-3 ${
                            message.sender === 'user'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100'
                        }`}
                        style={{ width: 'fit-content', wordBreak: 'break-word' }}
                    >
                      {message.sender === 'bot' &&
                      index === chatRooms[activeRoomId].length - 1 &&
                      isTyping ? typingText : message.text}
                      {message.sender === 'bot' &&
                          index === chatRooms[activeRoomId].length - 1 &&
                          isTyping && (
                              <span className="inline-block w-1 h-4 ml-1 bg-gray-500 animate-blink"></span>
                          )}
                    </div>
                    <span className={`text-xs text-gray-500 mt-1 ${
                        message.sender === 'user' ? 'text-right' : 'text-left'
                    }`}>
                  {message.timestamp}
                </span>
                  </div>
                </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* 메시지 입력 영역 */}
          <div className="p-4 border-t">
            <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const input = e.target.elements.message;
                  if (input.value.trim()) {
                    try {
                      await sendMessage(input.value);
                      input.value = '';
                    } catch (error) {
                      console.error('메시지 전송 오류:', error);
                    }
                  }
                }}
                className="flex gap-2"
            >
              <Input
                  name="message"
                  placeholder="메시지를 입력하세요..."
                  className="flex-1"
                  disabled={isTyping}
              />
              <Button type="submit" disabled={isTyping}>
                전송
              </Button>
            </form>
          </div>
        </div>
      </div>
  );
};

export default ChatInsetContent;