package com.linguagen.backend.service;

import com.theokanning.openai.completion.chat.ChatCompletionRequest;
import com.theokanning.openai.completion.chat.ChatCompletionResult;
import com.theokanning.openai.completion.chat.ChatMessage;
import com.theokanning.openai.service.OpenAiService;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.ArrayList;
import java.util.Map;

@Service
public class ChatGptService {

    private final OpenAiService openAiService;
    private final Map<String, List<ChatMessage>> chatHistories = new HashMap<>();
    private static final String SYSTEM_PROMPT = "당신은 영어 학습을 도와주는 AI 튜터입니다. " +
        "학습자의 영어 실력 향상을 위해 친절하고 이해하기 쉽게 설명해주세요. " +
        "필요한 경우 한국어로 설명할 수 있지만, 가능한 영어 사용을 권장해주세요. " +
        "문법 오류를 교정해주고, 더 자연스러운 표현을 제안해주세요.";

    public ChatGptService() {
        String apiKey = System.getenv("OPENAI_API_KEY");
        if (apiKey == null || apiKey.isEmpty()) {
            throw new IllegalStateException("OPENAI_API_KEY environment variable is not set");
        }
        this.openAiService = new OpenAiService(apiKey);
    }

    public String getChatbotResponse(String roomId, String userMessage) {
        List<ChatMessage> messages = chatHistories.computeIfAbsent(roomId, k -> {
            List<ChatMessage> newMessages = new ArrayList<>();
            // 시스템 프롬프트 추가
            newMessages.add(new ChatMessage("system", SYSTEM_PROMPT));
            return newMessages;
        });

        // 사용자 메시지 추가
        ChatMessage userChatMessage = new ChatMessage("user", userMessage);
        messages.add(userChatMessage);

        try {
            ChatCompletionRequest request = ChatCompletionRequest.builder()
                .model("gpt-4o-mini")
                .messages(messages)
                .temperature(0.7)
                .maxTokens(1000)
                .build();

            ChatCompletionResult result = openAiService.createChatCompletion(request);
            String botResponse = result.getChoices().get(0).getMessage().getContent();

            // 봇 응답 저장
            ChatMessage botChatMessage = new ChatMessage("assistant", botResponse);
            messages.add(botChatMessage);

            return botResponse;

        } catch (Exception e) {
            // API 호출 실패 시 에러 처리
            throw new RuntimeException("ChatGPT API 호출 중 오류 발생: " + e.getMessage(), e);
        }
    }

    // 채팅방의 대화 기록을 초기화하되, 시스템 프롬프트는 유지
    public void clearChatHistory(String roomId) {
        List<ChatMessage> messages = new ArrayList<>();
        messages.add(new ChatMessage("system", SYSTEM_PROMPT));
        chatHistories.put(roomId, messages);
    }

    // 채팅방의 현재 컨텍스트 크기 확인 (토큰 관리용)
    public int getContextSize(String roomId) {
        List<ChatMessage> messages = chatHistories.get(roomId);
        if (messages == null) return 0;

        return messages.stream()
            .mapToInt(msg -> msg.getContent().length())
            .sum();
    }
}
