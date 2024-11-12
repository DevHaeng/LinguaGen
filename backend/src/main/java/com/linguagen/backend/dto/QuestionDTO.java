package com.linguagen.backend.dto;

import com.linguagen.backend.entity.Question;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class QuestionDTO {
    private Long idx;
    private String type;
    private String detailType;
    private String interest;
    private Byte diffGrade;
    private Byte diffTier;
    private Question.QuestionFormat questionFormat;
    private String passage;
    private String question;
    private String correctAnswer;
    private String explanation;
    private List<ChoicesDTO> choices;

    @JsonIgnore
    private LocalDateTime createdAt;

    // 추가할 필드
    private String setId;
    private Integer questionOrder;
    private Integer totalQuestionsInSet; // 항상 15

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChoicesDTO {
        private Long idx;
        private String choiceLabel;
        private String choiceText;
    }
}
