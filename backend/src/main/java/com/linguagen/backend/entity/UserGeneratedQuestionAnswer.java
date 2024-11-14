package com.linguagen.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_generated_question_answer")
@Data
public class UserGeneratedQuestionAnswer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idx")
    private Long idx;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_idx", nullable = false)
    private UserGeneratedQuestion userGeneratedQuestion;

    @Column(name = "answer", nullable = false)
    private String answer;

    @Column(name = "is_correct", nullable = false)
    private Boolean isCorrect;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    @Column(name = "session_identifier")
    private String sessionIdentifier;

    public Long getQuestionIdx() {
        return userGeneratedQuestion != null ? userGeneratedQuestion.getIdx() : null;
    }

}
