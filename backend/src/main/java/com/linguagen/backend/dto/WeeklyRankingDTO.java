package com.linguagen.backend.dto;

public class WeeklyRankingDTO {
    private String userId; // 변경됨
    private Long exp; // 변경됨
    private int grade;

    public WeeklyRankingDTO(String userId, Long exp, int grade) { // 변경됨
        this.userId = userId;
        this.exp = exp;
        this.grade = grade;
    }

    // Getter, Setter
    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public Long getExp() {
        return exp;
    }

    public void setExp(Long exp) {
        this.exp = exp;
    }

    public int getGrade() {
        return grade;
    }

    public void setGrade(int grade) {
        this.grade = grade;
    }
}

