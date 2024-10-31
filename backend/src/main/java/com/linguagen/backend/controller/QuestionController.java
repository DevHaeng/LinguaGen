package com.linguagen.backend.controller;

import com.linguagen.backend.dto.QuestionDTO;
import com.linguagen.backend.service.QuestionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;


@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"},
    allowedHeaders = "*",
    allowCredentials = "true")  // React와 CORS 문제 해결
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j  // 로깅을 위한 어노테이션 추가
public class QuestionController {
    private final QuestionService questionService;
    private static final Logger logger = LoggerFactory.getLogger(QuestionController.class);


    // 모든 문제 조회
    @GetMapping("/questions")
    public ResponseEntity<List<QuestionDTO>> getAllQuestions() {
        return ResponseEntity.ok(questionService.getAllQuestions());
    }

    // 타입별 문제 조회
    @GetMapping("/questions/type/{type}")
    public ResponseEntity<List<QuestionDTO>> getQuestionsByType(@PathVariable String type) {
        return ResponseEntity.ok(questionService.getQuestionsByType(type));
    }

    // 난이도별 문제 조회 엔드포인트
    @GetMapping("/questions/difficulty/{grade}/{tier}")
    public ResponseEntity<List<QuestionDTO>> getQuestionsByDifficulty(@PathVariable Byte grade, @PathVariable Byte tier) {
        return ResponseEntity.ok(questionService.getQuestionsByDifficulty(grade, tier));
    }


    // 관심사별 문제 조회
    @GetMapping("/questions/interest/{interest}")
    public ResponseEntity<List<QuestionDTO>> getQuestionsByInterest(@PathVariable String interest) {
        return ResponseEntity.ok(questionService.getQuestionsByInterest(interest));
    }

    // 랜덤 문제 조회
    @GetMapping("/questions/random")
    public ResponseEntity<List<QuestionDTO>> getRandomQuestions(
        @RequestParam(defaultValue = "10") int count) {
        return ResponseEntity.ok(questionService.getRandomQuestions(count));
    }

    // 단일 문제 조회
    @GetMapping("/questions/{idx}")
    public ResponseEntity<QuestionDTO> getQuestionById(@PathVariable Long idx) {
        return ResponseEntity.ok(questionService.getQuestionById(idx));
    }

    // 난이도별 문제 조회 (개수 제한 추가)
    @GetMapping("/questions/difficulty")
    public ResponseEntity<List<QuestionDTO>> getQuestionsByDifficulty(
        @RequestParam Byte grade,
        @RequestParam Byte tier,
        @RequestParam(defaultValue = "10") int count) {
        return ResponseEntity.ok(questionService.getQuestionsByDifficultyWithCount(grade, tier, count));
    }

    // API 오류 처리
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFoundException(ResourceNotFoundException ex) {
        log.error("Resource not found error: ", ex);
        ErrorResponse error = new ErrorResponse(
            HttpStatus.NOT_FOUND.value(),
            ex.getMessage(),
            LocalDateTime.now()
        );
        return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
    }

    // 사용자 등급과 티어에 맞는 문제 조회
    @GetMapping("/questions/user/{userId}")
    public ResponseEntity<List<QuestionDTO>> getQuestionsForUser(@PathVariable("userId") String userId) {
        // 로그인한 회원의 아이디를 로깅
        logger.info("Request received to fetch questions for userId: " + userId);

        List<QuestionDTO> questions = questionService.getQuestionsForUser(userId);

        // 결과 로깅
        logger.info("Number of questions fetched for userId " + userId + ": " + questions.size());

        return ResponseEntity.ok(questions);
    }



    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneralException(Exception ex) {
        // 에러 로그 출력
        log.error("Unexpected error occurred: ", ex);

        // 개발 환경에서는 실제 에러 메시지를 반환
        ErrorResponse error = new ErrorResponse(
            HttpStatus.INTERNAL_SERVER_ERROR.value(),
            ex.getMessage(), // 실제 에러 메시지를 포함
            LocalDateTime.now()
        );
        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}

// 리소스를 찾지 못했을 때의 예외
class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
