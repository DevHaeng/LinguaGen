package com.linguagen.backend.controller;

import com.linguagen.backend.dto.GuessRequestDto;
import com.linguagen.backend.entity.DailyQuiz;
import com.linguagen.backend.service.DailyQuizService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class DailyQuizController {

    @Autowired
    private DailyQuizService service;

    @GetMapping("/daily-quiz")
    public ResponseEntity<DailyQuiz> getDailyQuiz() {
        DailyQuiz quiz = service.getDailyQuiz();
        return ResponseEntity.ok(quiz);
    }

    @PostMapping("/check-guess")
    public ResponseEntity<Map<String, Object>> checkGuess(@RequestBody GuessRequestDto request) {
        try {
            Map<String, Object> response = service.checkGuess(request.getGuess(), request.getAttemptNumber());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage(), "details", e.toString()));
        }
    }

    @PostMapping("/get-hint")
    public ResponseEntity<Map<String, Object>> getHint() {
        Map<String, Object> response = service.getHint();
        return ResponseEntity.ok(response);
    }
}