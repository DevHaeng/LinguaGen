package com.linguagen.backend.entity;


import com.linguagen.backend.entity.converter.QuestionFormatConverter;
import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "question")
@Data
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "question_sequence")
    @SequenceGenerator(
        name = "question_sequence",
        sequenceName = "question_seq",
        initialValue = 5041,  // 5040 다음 번호부터 시작
        allocationSize = 1
    )
    @Column(name = "idx", nullable = false, columnDefinition = "int unsigned")
    private Long idx; // 문제 식별자

    @Column(name = "type", nullable = false, length = 50)
    private String type; // 문제 유형

    @Column(name = "detail_type", nullable = false, length = 50)
    private String detailType; // 세부 유형

    @Column(name = "interest", nullable = false, length = 100)
    private String interest; // 관심사

    @Column(name = "diff_grade", nullable = false)
    private Byte diffGrade; // 난이도 등급

    @Column(name = "diff_tier", nullable = false)
    private Byte diffTier; // 난이도 티어

    @Convert(converter = QuestionFormatConverter.class)
    @Column(name = "question_format", nullable = false)
    private QuestionFormat questionFormat; // 문제 형식

    @Column(name = "passage", columnDefinition = "text")
    private String passage; // 지문

    @Column(name = "question", nullable = false, columnDefinition = "text")
    private String question; // 질문 문항

    @Column(name = "correct_answer", nullable = false, columnDefinition = "text")
    private String correctAnswer; // 정답

    @Column(name = "explanation", nullable = false, columnDefinition = "text")
    private String explanation; // 문제 해설

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt; // 등록 일자

    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Choices> choices = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // 연관관계 편의 메서드
    public void addChoice(Choices choice) {
        if (choices == null) {
            choices = new ArrayList<>();
        }
        choices.add(choice);
        if (choice.getQuestion() != this) {
            choice.setQuestion(this);  // 양방향 관계 설정 보장
        }
    }

    public void removeChoice(Choices choice) {
        choices.remove(choice);
        choice.setQuestion(null);
    }

    // 무한 순환 참조 방지를 위한 toString 재정의
    @Override
    public String toString() {
        return "Question(idx=" + idx +
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

    // equals와 hashCode는 idx만 사용하도록 재정의
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Question)) return false;
        Question question = (Question) o;
        return idx != null && idx.equals(question.getIdx());
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Getter
    public enum QuestionFormat {
        MULTIPLE_CHOICE("multiple-choice"),
        SHORT_ANSWER("short-answer");

        private final String value;

        QuestionFormat(String value) {
            this.value = value;
        }

    }
}

