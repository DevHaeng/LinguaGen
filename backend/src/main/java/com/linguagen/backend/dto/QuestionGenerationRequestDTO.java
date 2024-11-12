package com.linguagen.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class QuestionGenerationRequestDTO {
    @NotBlank(message = "관심사를 입력해주세요")
    private String topic;

    @NotBlank(message = "등급을 선택해주세요")
    private String grade;

    private Integer tier;

    @NotBlank(message = "문제유형을 선택해주세요")
    private String questionType;

    @NotBlank(message = "세부유형을 선택해주세요")
    private String detailType;

    // count 필드 제거 (항상 15문제로 고정)

    private String setId; // 새로 추가된 필드

}