package com.linguagen.backend.util;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import com.linguagen.backend.exception.UnauthorizedException;

@Slf4j
@Component
@RequiredArgsConstructor
public class SessionUtil {
    private final HttpSession session;

    public String getCurrentUserId() {
        // 테스트를 위해 임시로 고정된 사용자 ID 반환
        return "qwer@naver.com";

        /* 실제 운영 코드
        String userId = (String) session.getAttribute("id");
        if (userId == null) {
            throw new UnauthorizedException("로그인이 필요한 서비스입니다.");
        }
        return userId;
        */
    }

    public boolean isLoggedIn() {
        return true;  // 테스트를 위해 항상 true 반환
    }
}
