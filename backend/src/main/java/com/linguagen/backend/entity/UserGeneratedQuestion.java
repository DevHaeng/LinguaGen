package com.linguagen.backend.entity;

import com.linguagen.backend.entity.converter.QuestionFormatConverter;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "user_generated_question")
@Data
public class UserGeneratedQuestion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idx", nullable = false, columnDefinition = "int unsigned")
    private Long idx;

    // User 엔티티와의 관계 설정
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User userId;

    @Column(name = "type", nullable = false, length = 50)
    private String type;

    @Column(name = "detail_type", nullable = false, length = 50)
    private String detailType;

    @Column(name = "interest", nullable = false, length = 100)
    private String interest;

    @Column(name = "diff_grade", nullable = false)
    private Byte diffGrade;

    @Column(name = "diff_tier", nullable = false)
    private Byte diffTier;

    @Convert(converter = QuestionFormatConverter.class)
    @Column(name = "question_format", nullable = false)
    private Question.QuestionFormat questionFormat;

    @Column(name = "passage", columnDefinition = "text")
    private String passage;

    @Column(name = "question", nullable = false, columnDefinition = "text")
    private String question;

    @Column(name = "correct_answer", nullable = false, columnDefinition = "text")
    private String correctAnswer;

    @Column(name = "explanation", nullable = false, columnDefinition = "text")
    private String explanation;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "userGeneratedQuestion", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<UserGeneratedQuestionChoice> choices = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    @Column(name = "set_id", nullable = false)
    private String setId;  // 세트 ID 필드 추가

    @Column(name = "question_order")
    private Integer questionOrder;  // 세트 내 문제 순서


    public void addChoice(UserGeneratedQuestionChoice choice) {
        choices.add(choice);
        choice.setUserGeneratedQuestion(this);
    }

    @Override
    public String toString() {
        return "UserGeneratedQuestion(idx=" + idx +
            ", userId=" + (userId != null ? userId.getId() : null) +
            ", type=" + type +
            ", detailType=" + detailType +
            ", interest=" + interest +
            ", diffGrade=" + diffGrade +
            ", diffTier=" + diffTier +
            ", questionFormat=" + questionFormat +
            ", question=" + question +
            ", correctAnswer=" + correctAnswer +
            ", createdAt=" + createdAt + ")";
    }
}