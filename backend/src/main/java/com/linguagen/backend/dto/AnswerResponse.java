package com.linguagen.backend.dto;

import com.linguagen.backend.entity.StudentAnswer;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AnswerResponse {
    private Boolean isCorrect;
    private String feedback;
    private Boolean completed;
    private Integer correctCount;
    private Integer totalQuestions;
    private String message;


    public AnswerResponse(StudentAnswer answer, SessionStatus status) {
        this.isCorrect = answer.getIsCorrect() == 1;
        this.feedback = answer.getFeedback();
        this.completed = status.getCompleted();
        this.correctCount = status.getCorrectCount();
        this.totalQuestions = status.getTotalQuestions();
    }

    // 새로운 생성자 추가
    public AnswerResponse(Boolean isCorrect, String message) {
        this.isCorrect = isCorrect;
        this.message = message;
    }

}