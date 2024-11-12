package com.linguagen.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

// QuestionSetDTO.java (새로 생성)
@Data
@AllArgsConstructor
@NoArgsConstructor
public class QuestionSetDTO {
    private String id;              // setId
    private String topic;           // 관심사/주제
    private String grade;           // 등급
    private Integer tier;           // 티어
    private String questionType;    // 문제 유형
    private String detailType;      // 세부 유형
    private LocalDateTime createdAt;// 생성 시간
    private int questionCount;      // 항상 15
}
