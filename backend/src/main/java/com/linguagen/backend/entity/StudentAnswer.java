package com.linguagen.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Setter
@Getter
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "student_answers")
public class StudentAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "answer_id", nullable = false, columnDefinition = "int unsigned")
    private Long answerId;

    @ManyToOne
    @JoinColumn(name = "idx", referencedColumnName = "idx", nullable = false)
    private Question question;  // Question 엔티티와의 관계 설정

    @Column(name = "student_id", nullable = false)
    private String studentId;

    @Column(name = "student_answer", nullable = false, columnDefinition = "text")
    private String studentAnswer;

    @Column(name = "is_correct")
    private Boolean isCorrect;

    @Column(name = "score")
    private Integer score;

    @Column(name = "feedback", columnDefinition = "text")
    private String feedback;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }


}
