package com.linguagen.backend.service;

import com.linguagen.backend.dto.AnswerStatus;
import com.linguagen.backend.dto.SessionStatus;
import com.linguagen.backend.entity.Question;
import com.linguagen.backend.entity.StudentAnswer;
import com.linguagen.backend.exception.SessionExpiredException;
import com.linguagen.backend.repository.QuestionRepository;
import com.linguagen.backend.repository.StudentAnswerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class StudentAnswerService {
    private final StudentAnswerRepository studentAnswerRepository;
    private final QuestionRepository questionRepository;
    private final GameSessionManager gameSessionManager;
    private final AnswerProcessor answerProcessor;

    public String startNewSession(String userId) {
        return gameSessionManager.createSession(userId);
    }

    @Transactional
    public StudentAnswer saveStudentAnswer(String sessionIdentifier, Long idx,
                                           String studentId, String studentAnswer,
                                           Integer questionOrder) {
        // 세션 활성 상태 확인
        if (!gameSessionManager.isSessionActive(sessionIdentifier)) {
            throw new SessionExpiredException("Session has expired");
        }

        // 기존 답안 확인
        Optional<StudentAnswer> existingAnswer = studentAnswerRepository
            .findBySessionIdentifierAndQuestionOrder(sessionIdentifier, questionOrder);

        StudentAnswer answer;
        if (existingAnswer.isPresent()) {
            answer = existingAnswer.get();
            answer.setStudentAnswer(studentAnswer);
        } else {
            Question question = questionRepository.findById(idx)
                .orElseThrow(() -> new IllegalArgumentException("Question not found: " + idx));

            answer = new StudentAnswer();
            answer.setSessionIdentifier(sessionIdentifier);
            answer.setQuestion(question);
            answer.setStudentId(studentId);
            answer.setStudentAnswer(studentAnswer);
            answer.setQuestionOrder(questionOrder);
        }

        // 답안 처리
        answerProcessor.processAnswer(answer);
        return studentAnswerRepository.save(answer);
    }

    public SessionStatus getSessionStatus(String sessionIdentifier) {
        List<StudentAnswer> answers = studentAnswerRepository
            .findBySessionIdentifierOrderByQuestionOrder(sessionIdentifier);

        long correctCount = answers.stream()
            .filter(a -> a.getIsCorrect() == 1)
            .count();

        return new SessionStatus(
            sessionIdentifier,
            (int) correctCount,
            15,
            answers.size() >= 15,
            answers.stream()
                .map(a -> new AnswerStatus(a.getQuestionOrder(), a.getIsCorrect()))
                .collect(Collectors.toList())
        );
    }

    public Optional<String> getActiveSession(String userId) {
        Optional<String> sessionId = studentAnswerRepository
            .findFirstSessionIdentifierByStudentIdOrderByCreatedAtDesc(userId);

        if (sessionId.isPresent() && gameSessionManager.isSessionActive(sessionId.get())) {
            long answerCount = studentAnswerRepository.countBySessionIdentifier(sessionId.get());
            if (answerCount < 15) {
                return sessionId;
            }
        }
        return Optional.empty();
    }

    @Transactional
    public void completeSession(String sessionIdentifier) {
        List<StudentAnswer> answers = studentAnswerRepository
            .findBySessionIdentifierOrderByQuestionOrder(sessionIdentifier);


        log.debug("Session Identifier: {}", sessionIdentifier);
        log.debug("Number of answers found: {}", answers.size());

        if (answers == null || answers.isEmpty()) {
            // 빈 리스트인 경우 처리
            log.warn("No answers found for session: {}", sessionIdentifier);
            // 필요한 경우 예외를 던지거나, 빈 결과를 반환
            return;
        }

        if (answers.size() < 15) {
            String studentId = answers.get(0).getStudentId();
            for (int order = 1; order <= 15; order++) {
                int finalOrder = order; // 람다에서 사용할 final 변수로 선언
                if (answers.stream().noneMatch(a -> a.getQuestionOrder() == finalOrder)) {
                    StudentAnswer unsolvedAnswer = new StudentAnswer();
                    unsolvedAnswer.setSessionIdentifier(sessionIdentifier);
                    unsolvedAnswer.setStudentId(studentId);
                    unsolvedAnswer.setQuestionOrder(finalOrder);
                    unsolvedAnswer.setStudentAnswer("NO_ANSWER");
                    unsolvedAnswer.setIsCorrect(2);
                    unsolvedAnswer.setFeedback("미응답");
                    studentAnswerRepository.save(unsolvedAnswer);
                }
            }

        }
    }
}