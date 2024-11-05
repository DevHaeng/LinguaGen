package com.linguagen.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name ="grade_test")
public class GradeTest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idx;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false)
    private User user;

    @Column(name = "temp_grade", nullable = false)
    private int tempGrade;

    @Column(name = "temp_tier", nullable = false)
    private int tempTier;

    @Column(name = "total_questions", nullable = false, columnDefinition = "INT DEFAULT 0")
    private int totalQuestions;

    @Column(name = "result")
    private Integer result;

    @Column(name = "start_at", nullable = false)
    private LocalDateTime startAt;

    @Column(name = "end_at")
    private LocalDateTime endAt;

}
