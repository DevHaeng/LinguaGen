package com.linguagen.backend.controller;

import com.linguagen.backend.dto.*;
import com.linguagen.backend.enums.QuestionType;
import com.linguagen.backend.exception.UnauthorizedException;
import com.linguagen.backend.service.UserGeneratedQuestionService;
import com.linguagen.backend.util.SessionUtil;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/user-questions")
@Slf4j
@RequiredArgsConstructor
public class UserGeneratedQuestionController {
    private final UserGeneratedQuestionService userGeneratedQuestionService;

    @PostMapping("/generate")
    public ResponseEntity<?> generateQuestion(@RequestBody @Valid QuestionGenerationRequestDTO request) {
        try {
            String userId = SessionUtil.getCurrentUserId();
            String setId = userGeneratedQuestionService.generateQuestion(request, userId);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Question set generated successfully");
            response.put("setId", setId);

            return ResponseEntity.ok(response);

        } catch (UnauthorizedException e) {
            System.out.println("UnauthorizedException caught: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("Error generating questions", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error generating questions: " + e.getMessage());
        }
    }

    // 새로운 엔드포인트 추가
    @GetMapping("/sets")
    public ResponseEntity<List<QuestionSetDTO>> getQuestionSets() {
        try {
            String userId = SessionUtil.getCurrentUserId();
            List<QuestionSetDTO> sets = userGeneratedQuestionService.getQuestionSets(userId);
            return ResponseEntity.ok(sets);
        } catch (UnauthorizedException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @GetMapping("/sets/{setId}")
    public ResponseEntity<List<QuestionDTO>> getQuestionsBySet(@PathVariable String setId) {
        log.info("Fetching user generated questions for set: {}", setId);
        List<QuestionDTO> questions = userGeneratedQuestionService.getQuestionsBySetIdAsQuestionDTO(setId);
        return ResponseEntity.ok(questions);
    }

    @PostMapping("/select-set")
    public ResponseEntity<?> selectQuestionSet(@RequestBody Map<String, String> request) {
        try {
            String userId = SessionUtil.getCurrentUserId();
            String setId = request.get("setId");

            if (setId == null || setId.isEmpty()) {
                return ResponseEntity.badRequest().body("setId is required");
            }

            userGeneratedQuestionService.selectQuestionSet(userId, setId);
            return ResponseEntity.ok()
                .body(Map.of(
                    "message", "Question set selected successfully",
                    "setId", setId
                ));
        } catch (UnauthorizedException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", e.getMessage()));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Error selecting question set: " + e.getMessage()));
        }
    }

    @PostMapping("/deselect-set")
    public ResponseEntity<?> deselectQuestionSet() {
        try {
            String userId = SessionUtil.getCurrentUserId();
            userGeneratedQuestionService.deselectQuestionSet(userId);
            return ResponseEntity.ok()
                .body(Map.of("message", "Question set deselected successfully"));
        } catch (UnauthorizedException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Error deselecting question set: " + e.getMessage()));
        }
    }

    @GetMapping("/selected-set")
    public ResponseEntity<?> getSelectedQuestionSet() {
        try {
            String userId = SessionUtil.getCurrentUserId();
            QuestionSetDTO selectedSet = userGeneratedQuestionService.getSelectedQuestionSet(userId);

            if (selectedSet == null) {
                return ResponseEntity.noContent().build();
            }

            return ResponseEntity.ok(selectedSet);
        } catch (UnauthorizedException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Error getting selected question set: " + e.getMessage()));
        }
    }

    private QuestionDTO convertToQuestionDTO(UserGeneratedQuestionDTO userQuestion) {
        QuestionDTO dto = new QuestionDTO();
        dto.setIdx(userQuestion.getIdx());
        dto.setType(userQuestion.getType());
        dto.setDetailType(userQuestion.getDetailType());
        dto.setQuestionFormat(userQuestion.getQuestionFormat());
        dto.setPassage(userQuestion.getPassage());
        dto.setQuestion(userQuestion.getQuestion());
        dto.setCorrectAnswer(userQuestion.getCorrectAnswer());
        dto.setExplanation(userQuestion.getExplanation());

        // Choice 변환 로직 추가
        if (userQuestion.getChoices() != null) {
            List<QuestionDTO.ChoicesDTO> choiceDTOs = userQuestion.getChoices().stream()
                .map(choice -> new QuestionDTO.ChoicesDTO(
                    choice.getIdx(),
                    choice.getChoiceLabel(),
                    choice.getChoiceText()
                ))
                .collect(Collectors.toList());
            dto.setChoices(choiceDTOs);
        }

        return dto;
    }

    @GetMapping("/my-questions")
    public ResponseEntity<List<UserGeneratedQuestionDTO>> getMyQuestions() {
        try {
            String userId = SessionUtil.getCurrentUserId();
            List<UserGeneratedQuestionDTO> questions = userGeneratedQuestionService.getUserQuestions(userId);
            return ResponseEntity.ok(questions);
        } catch (UnauthorizedException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @Autowired
    private HttpSession session;

    @PostMapping("/submit-answer")
    public ResponseEntity<AnswerResponse> submitAnswer(@RequestBody AnswerSubmitRequest request) {
        try {
            String userId = SessionUtil.getCurrentUserId();
            AnswerResponse response = userGeneratedQuestionService.submitAnswer(
                userId,
                request.getQuestionIdx(),
                request.getAnswer(),
                request.getSessionIdentifier() // 세션 식별자 추가
            );
            return ResponseEntity.ok(response);
        } catch (UnauthorizedException e) {
            log.error("Unauthorized access", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        } catch (Exception e) {
            log.error("Error submitting answer", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/sets/{setId}/answers")
    public ResponseEntity<List<AnswerResponse>> getAnswerHistory(@PathVariable String setId) {
        try {
            String userId = SessionUtil.getCurrentUserId();
            List<AnswerResponse> answers = userGeneratedQuestionService.getAnswerHistory(userId, setId);
            return ResponseEntity.ok(answers);
        } catch (Exception e) {
            log.error("Error getting answer history", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }


    @Data
    static
    class AnswerSubmitRequest {
        private Long questionIdx;
        private String answer;
        private String sessionIdentifier; // 세션 식별자 필드 추가

    }



    private void validateRequest(QuestionGenerationRequestDTO request) {
        // 등급 검증
        List<String> validGrades = List.of("브론즈", "실버", "골드", "플래티넘", "다이아", "챌린저");
        if (!validGrades.contains(request.getGrade())) {
            throw new IllegalArgumentException("Invalid grade: " + request.getGrade());
        }

        // 챌린저가 아닐 경우에만 티어 검증
        if (!"챌린저".equals(request.getGrade())) {
            if (request.getTier() == null) {
                throw new IllegalArgumentException("Tier is required for non-challenger grade");
            }
            if (request.getTier() < 1 || request.getTier() > 4) {
                throw new IllegalArgumentException("Invalid tier: " + request.getTier());
            }
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