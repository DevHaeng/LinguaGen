import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, X, Minimize2, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const ChatInterface = ({
                           messages = [],
                           onSendMessage,
                           activeRoomId,
                           onClose,
                           onMinimize
                       }) => {
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);

    // 새 메시지가 올 때마다 스크롤 맨 아래로
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);


    const handleSend = async () => {
        if (input.trim() && !isLoading) {
            setIsLoading(true);
            setError(null);
            try {
                await onSendMessage(input.trim());
                setInput('');
            } catch (error) {
                setError('메시지 전송에 실패했습니다. 다시 시도해주세요.');
                setTimeout(() => setError(null), 3000); // 3초 후 에러 메시지 사라짐
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleMinimize = () => {
        setIsMinimized(!isMinimized);
        onMinimize?.(!isMinimized);
    };

    const formatTimestamp = () => {
        const now = new Date();
        return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    };

    // 챗봇 설명 메시지
    const getBotDescription = (roomId) => {
        switch(roomId) {
            case 'Room_1':
                return '영어 문법과 작문을 도와주는 튜터입니다.';
            case 'Room_2':
                return '영어 회화와 발음을 도와주는 튜터입니다.';
            case 'Room_3':
                return '영어 독해와 어휘를 도와주는 튜터입니다.';
            default:
                return '영어 학습을 도와주는 튜터입니다.';
        }
    };

    return (
        <Card className={`fixed ${isMinimized ? 'h-14' : 'h-[500px]'} transition-all duration-300 ease-in-out
      ${activeRoomId === 'Room_1' ? 'bottom-4 right-4' :
            activeRoomId === 'Room_2' ? 'bottom-4 right-[360px]' :
                'bottom-4 right-[680px]'} 
      w-80 flex flex-col shadow-lg`}
        >
            <div className="bg-primary p-3 text-white rounded-t-lg flex justify-between items-center cursor-pointer"
                 onClick={handleMinimize}>
                <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6">
                        <AvatarImage src="/bot-avatar.png" />
                        <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                    <h3 className="text-lg font-semibold">{activeRoomId}</h3>
                </div>
                <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={handleMinimize}>
                        {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {!isMinimized && (
                <>
                    <div className="p-2 bg-muted/50 border-b text-xs text-muted-foreground">
                        {getBotDescription(activeRoomId)}
                    </div>

                    <CardContent className="flex-1 overflow-y-auto p-4 space-y-4" ref={chatContainerRef}>
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                {msg.sender === 'bot' && (
                                    <Avatar className="w-8 h-8">
                                        <AvatarImage src="/bot-avatar.png" />
                                        <AvatarFallback>AI</AvatarFallback>
                                    </Avatar>
                                )}

                                <div
                                    className={`max-w-[70%] p-3 rounded-lg ${
                                        msg.sender === 'user'
                                            ? 'bg-primary text-white rounded-br-none'
                                            : 'bg-muted rounded-bl-none'
                                    }`}
                                >
                                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                                    <span className="text-xs opacity-70 mt-1 block">
                    {formatTimestamp()}
                  </span>
                                </div>

                                {msg.sender === 'user' && (
                                    <Avatar className="w-8 h-8">
                                        <AvatarImage src="/user-avatar.png" />
                                        <AvatarFallback>ME</AvatarFallback>
                                    </Avatar>
                                )}
                            </div>
                        ))}
                        {error && (
                            <Alert
                                variant="destructive"
                                onClose={() => setError(null)}
                            >
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        <div ref={messagesEndRef} />
                    </CardContent>

                    <div className="p-4 border-t">
                        <div className="flex gap-2">
              <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="메시지를 입력하세요..."
                  className="flex-1 resize-none rounded-md border p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={1}
                  disabled={isLoading}
              />
                            <Button
                                onClick={handleSend}
                                disabled={isLoading || !input.trim()}
                                size="icon"
                            >
                                {isLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Send className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </Card>
    );
};

export default ChatInterface;