package com.linguagen.backend.controller;

import com.linguagen.backend.dto.QuestionDTO;
import com.linguagen.backend.dto.QuestionGenerationRequestDTO;
import com.linguagen.backend.enums.QuestionType;
import com.linguagen.backend.exception.UnauthorizedException;
import com.linguagen.backend.service.QuestionGeneratorService;
import com.linguagen.backend.util.SessionUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/questions")
@Slf4j
@RequiredArgsConstructor
public class QuestionGeneratorController {
    private final QuestionGeneratorService questionGeneratorService;
    private final SessionUtil sessionUtil;

    @PostMapping("/generate")
    public ResponseEntity<?> generateQuestions(@RequestBody @Valid QuestionGenerationRequestDTO request) {
        try {
            // 세션에서 사용자 정보 가져오기
            String userId = sessionUtil.getCurrentUserId();

            validateRequest(request);
            questionGeneratorService.generateQuestions(request, userId);
            return ResponseEntity.ok("Questions generated successfully");
        } catch (UnauthorizedException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("Error generating questions", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error generating questions: " + e.getMessage());
        }
    }

    @GetMapping("/my-questions")
    public ResponseEntity<List<QuestionDTO>> getMyQuestions() {
        try {
            String userId = sessionUtil.getCurrentUserId();
            List<QuestionDTO> questions = questionGeneratorService.getUserGeneratedQuestions(userId);
            return ResponseEntity.ok(questions);
        } catch (UnauthorizedException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    private void validateRequest(QuestionGenerationRequestDTO request) {
        // 등급 검증
        List<String> validGrades = List.of("브론즈", "실버", "골드", "플래티넘", "다이아");
        if (!validGrades.contains(request.getGrade())) {
            throw new IllegalArgumentException("Invalid grade: " + request.getGrade());
        }

        // 티어 검증
        if (request.getTier() < 1 || request.getTier() > 4) {
            throw new IllegalArgumentException("Invalid tier: " + request.getTier());
        }

        // 문제 유형 검증
        QuestionType questionType = Arrays.stream(QuestionType.values())
            .filter(type -> type.getValue().equals(request.getQuestionType()))
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("Invalid question type: " + request.getQuestionType()));

        // 세부 유형 검증
        if (!questionType.getDetailTypes().contains(request.getDetailType())) {
            throw new IllegalArgumentException("Invalid detail type: " + request.getDetailType());
        }
    }
}