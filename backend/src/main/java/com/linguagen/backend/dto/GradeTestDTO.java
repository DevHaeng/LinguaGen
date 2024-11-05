package com.linguagen.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class GradeTestDTO {
    @JsonProperty("userId")
    private String userId;

    @JsonProperty("tempGrade")
    private Integer tempGrade;

    @JsonProperty("tempTier")
    private Integer tempTier;
}
