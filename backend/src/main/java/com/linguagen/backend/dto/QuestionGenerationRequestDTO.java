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

    @NotNull(message = "티어를 선택해주세요")
    @Min(value = 1, message = "티어는 1 이상이어야 합니다")
    @Max(value = 4, message = "티어는 4 이하여야 합니다")
    private Integer tier;

    @NotBlank(message = "문제유형을 선택해주세요")
    private String questionType;

    @NotBlank(message = "세부유형을 선택해주세요")
    private String detailType;

    @NotNull(message = "생성할 문제 수를 입력해주세요")
    @Min(value = 1, message = "최소 1개 이상의 문제를 생성해야 합니다")
    private Integer count;
}