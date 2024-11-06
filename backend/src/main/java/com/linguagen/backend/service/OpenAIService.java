package com.linguagen.backend.service;

import com.linguagen.backend.exception.OpenAIException;
import com.theokanning.openai.completion.chat.ChatCompletionRequest;
import com.theokanning.openai.completion.chat.ChatMessage;
import com.theokanning.openai.service.OpenAiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class OpenAIService {
    private final OpenAiService openAiService;

    @Value("${openai.api.timeout:60}") // 기본값 60초
    private long timeout;

    @Value("${openai.api.maxRetries:3}") // 기본값 3회
    private int maxRetries;

    public String getCompletion(String prompt) {
        int retryCount = 0;
        while (retryCount < maxRetries) {
            try {
                ChatCompletionRequest request = ChatCompletionRequest.builder()
                    .model("gpt-4o-mini")
                    .messages(List.of(new ChatMessage("user", prompt)))
                    .temperature(0.7)
                    .build();

                return openAiService.createChatCompletion(request)
                    .getChoices().get(0).getMessage().getContent();

            } catch (Exception e) {
                retryCount++;
                if (retryCount == maxRetries) {
                    log.error("Final attempt failed for OpenAI API call after {} retries", maxRetries, e);
                    throw new OpenAIException("Failed to get completion from OpenAI after " + maxRetries + " attempts", e);
                }
                log.warn("Attempt {} failed. Retrying...", retryCount, e);
                // 지수 백오프로 대기 시간 증가
                try {
                    Thread.sleep((long) (Math.pow(2, retryCount) * 1000));
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    throw new OpenAIException("Interrupted while waiting to retry", ie);
                }
            }
        }
        throw new OpenAIException("Failed to get completion from OpenAI");
    }
}
