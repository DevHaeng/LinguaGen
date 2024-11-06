package com.linguagen.backend.enums;

import lombok.Getter;

import java.util.Arrays;
import java.util.List;

@Getter
public enum QuestionType {
    READING("리딩", Arrays.asList(
        "주제/제목 찾기",
        "요지 파악",
        "세부 정보 찾기",
        "지칭 추론",
        "어휘 추론"
    )),
    LISTENING("리스닝", Arrays.asList(
        "주제/목적 파악",
        "세부 정보 듣기",
        "화자의 태도/의견 추론",
        "대화/강의 구조 파악",
        "함축적 의미 추론"
    )),
    OTHERS("기타", Arrays.asList(
        "문법 문제",
        "어휘 문제",
        "말하기 문제",
        "쓰기 문제"
    ));

    private final String value;
    private final List<String> detailTypes;

    QuestionType(String value, List<String> detailTypes) {
        this.value = value;
        this.detailTypes = detailTypes;
    }

    public static boolean isWritingSpeakingType(String detailType) {
        return "말하기 문제".equals(detailType) || "쓰기 문제".equals(detailType);
    }
}
