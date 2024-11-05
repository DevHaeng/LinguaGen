package com.linguagen.backend.controller;

import com.linguagen.backend.service.ChatGptService;
import com.linguagen.backend.dto.ChatRequestDTO;
import com.linguagen.backend.dto.ChatResponseDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatGptService chatGptService;

    public ChatController(ChatGptService chatGptService) {
        this.chatGptService = chatGptService;
    }

    @PostMapping("/message")
    public ResponseEntity<ChatResponseDTO> sendMessage(@RequestBody ChatRequestDTO chatRequest) {
        String botResponse = chatGptService.getChatbotResponse(chatRequest.getRoomId(), chatRequest.getMessage());
        return ResponseEntity.ok(new ChatResponseDTO(botResponse));
    }

    @DeleteMapping("/room/{roomId}")
    public ResponseEntity<Void> deleteChatHistory(@PathVariable String roomId) {
        chatGptService.clearChatHistory(roomId);
        return ResponseEntity.noContent().build();
    }
}
