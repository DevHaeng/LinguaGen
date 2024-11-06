package com.linguagen.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OpenAIPromptDTO {
    private String topic;
    private String questionType;
    private String detailType;
    private String questionFormat;
    private String prompt;
}