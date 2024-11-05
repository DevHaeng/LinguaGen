package com.linguagen.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GradeDTO {
    private int idx;
    private String userId;
    private int grade;
    private int tier;
    private int exp;
    private LocalDateTime updated_at;
}
