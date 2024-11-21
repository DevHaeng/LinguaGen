package com.linguagen.backend.service;

import com.linguagen.backend.dto.AnswerResponse;
import com.linguagen.backend.entity.Question;
import com.linguagen.backend.entity.StudentAnswer;
import com.linguagen.backend.entity.Grade;
import com.linguagen.backend.repository.GradeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnswerProcessor {

    private final QuestionService questionService;
    private final GradeRepository gradeRepository; // GradeRepository 추가
    private final GradeService gradeService;

    // 학생의 grade 조회
    public int getStudentGrade(String userId) {
        Grade grade = gradeRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자의 grade 정보를 찾을 수 없습니다: " + userId));
        return grade.getGrade(); // grade 값 반환
    }

    // 학생의 tier 조회
    public int getStudentTier(String userId) {
        Grade grade = gradeRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자의 tier 정보를 찾을 수 없습니다: " + userId));
        return grade.getTier(); // tier 값 반환
    }

    @Transactional
    public void processAnswer(StudentAnswer answer) {
        Question question = answer.getQuestion();
        String studentAnswer = answer.getStudentAnswer();

        if (question.getQuestionFormat() == Question.QuestionFormat.MULTIPLE_CHOICE) {
            processMultipleChoiceAnswer(answer, question);
        } else {
            processShortAnswer(answer, question);
        }
    }

    private void processMultipleChoiceAnswer(StudentAnswer answer, Question question) {
        String correctLabel = question.getCorrectAnswer();
        String studentLabel = answer.getStudentAnswer();

        boolean isCorrect = correctLabel.equalsIgnoreCase(studentLabel);
        answer.setIsCorrect(isCorrect ? 1 : 0);

        if (isCorrect) {
            answer.setFeedback("정답입니다!");

            // 등급 정보 로깅
            log.debug("Student grade info - StudentId: {}, Grade: {}, Tier: {}", 
                answer.getStudentId(),
                getStudentGrade(answer.getStudentId()),
                getStudentTier(answer.getStudentId()));
            
            log.debug("Question grade info - Grade: {}, Tier: {}", 
                question.getDiffGrade(),
                question.getDiffTier());

            // 점수 계산 과정 로깅
            int studentGrade = getStudentGrade(answer.getStudentId());
            int questionGrade = question.getDiffGrade();
            int studentTier = getStudentTier(answer.getStudentId());
            int questionTier = question.getDiffTier();

            int scoreToAdd;
            if (questionGrade > studentGrade || questionTier < studentTier) {
                scoreToAdd = 3;
                log.debug("높은 등급/티어 문제 정답: +3점");
            } else if (questionGrade == studentGrade && questionTier == studentTier) {
                scoreToAdd = 2;
                log.debug("동일 등급/티어 문제 정답: +2점");
            } else {
                scoreToAdd = 1;
                log.debug("낮은 등급/티어 문제 정답: +1점");
            }

            // 점수 설정 및 로깅
            answer.setScore(scoreToAdd);
            log.debug("Final score set - StudentId: {}, Score: {}, QuestionGrade: {}, StudentGrade: {}", 
                answer.getStudentId(), 
                scoreToAdd, 
                questionGrade, 
                studentGrade);

            // exp 업데이트
            gradeService.updateGradeExp(answer.getStudentId(), scoreToAdd);

        } else {
            String correctAnswerText = question.getChoices().stream()
                    .filter(c -> c.getChoiceLabel().equalsIgnoreCase(correctLabel))
                    .findFirst()
                    .map(c -> c.getChoiceText())
                    .orElse("");
            // 점수를 StudentAnswer에 설정
            answer.setScore(0);
            log.debug("오답 처리 - 학생ID: {}, 점수: 0", answer.getStudentId());
            answer.setFeedback("오답입니다. 정답은 " + correctLabel + ") " + correctAnswerText + " 입니다.");
        }
    }

    private void processShortAnswer(StudentAnswer answer, Question question) {
        String correctAnswer = question.getCorrectAnswer();
        String studentAnswer = answer.getStudentAnswer().trim();

        boolean isCorrect = correctAnswer.equalsIgnoreCase(studentAnswer);
        answer.setIsCorrect(isCorrect ? 1 : 0);

        if (isCorrect) {
            answer.setFeedback("정답입니다!");

            // 등급 정보 조회 및 점수 계산
            int studentGrade = getStudentGrade(answer.getStudentId());
            int questionGrade = question.getDiffGrade();
            int studentTier = getStudentTier(answer.getStudentId());
            int questionTier = question.getDiffTier();

            int scoreToAdd;
            if (questionGrade > studentGrade || questionTier < studentTier) {
                scoreToAdd = 3; // 높은 등급 문제를 맞춘 경우
                log.debug("높은 등급/티어 문제 정답: +3점");
            } else if (questionGrade == studentGrade && questionTier == studentTier) {
                scoreToAdd = 2; // 동일 등급 문제를 맞춘 경우
                log.debug("동일 등급/티어 문제 정답: +2점");
            } else {
                scoreToAdd = 1; // 낮은 등급 문제를 맞춘 경우
                log.debug("낮은 등급/티어 문제 정답: +1점");
            }

            // 점수를 StudentAnswer에 설정
            answer.setScore(scoreToAdd);
            log.debug("계산된 점수 설정 - 학생ID: {}, 점수: {}, 문제등급: {}, 학생등급: {}", 
                answer.getStudentId(), scoreToAdd, questionGrade, studentGrade);

            // 별도 트랜잭션으로 exp 업데이트
            gradeService.updateGradeExp(answer.getStudentId(), scoreToAdd);

        } else {
            answer.setFeedback("오답입니다. 정답은 '" + correctAnswer + "' 입니다.");
            // 점수를 StudentAnswer에 설정
            answer.setScore(0);
            log.debug("오답 처리 - 학생ID: {}, 점수: 0", answer.getStudentId());
        }
    }

}
