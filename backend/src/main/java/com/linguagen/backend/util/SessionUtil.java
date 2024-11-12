package com.linguagen.backend.util;

import com.linguagen.backend.exception.UnauthorizedException;
import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Slf4j
public class SessionUtil {

    // 현재 세션에서 사용자 ID를 가져옵니다.
    public static String getCurrentUserId() {
        HttpSession session = getSession();
        String userId = (String) session.getAttribute("id");

        // 세션 디버깅을 위한 로그 추가
        log.debug("Current Session ID: {}", session.getId());
        log.debug("User ID from session: {}", userId);

        if (userId == null) {
            log.debug("No user ID found in session");
            throw new UnauthorizedException("로그인이 필요한 서비스입니다.");
        }
        return userId;
    }

    // 현재 세션에 사용자 ID를 저장합니다.
    public static void setCurrentUserId(String userId) {
        HttpSession session = getSession();
        session.setAttribute("id", userId);
        log.debug("Set current user ID: {}", userId);
    }

    // 세션에 임의의 속성을 저장합니다.
    public static void setAttribute(String key, Object value) {
        HttpSession session = getSession();
        session.setAttribute(key, value);
        log.debug("Set session attribute: {} = {}", key, value);
    }

    // 세션에서 임의의 속성을 가져옵니다.
    public static Object getAttribute(String key) {
        HttpSession session = getSession();
        Object value = session.getAttribute(key);
        log.debug("Get session attribute: {} = {}", key, value);
        return value;
    }

    // 세션 가져오기
    private static HttpSession getSession() {
        ServletRequestAttributes attr = (ServletRequestAttributes) RequestContextHolder.currentRequestAttributes();
        return attr.getRequest().getSession(true); // 세션이 없을 경우 생성
    }


    // 현재 선택된 문제 세트 ID 관리
    public static void setCurrentQuestionSetId(String setId) {
        HttpSession session = getSession();
        session.setAttribute("currentQuestionSetId", setId);
        log.debug("Set current question set ID: {}", setId);
    }

    public static String getCurrentQuestionSetId() {
        HttpSession session = getSession();
        String setId = (String) session.getAttribute("currentQuestionSetId");
        log.debug("Retrieved current question set ID: {}", setId);
        return setId;
    }

    public static void clearCurrentQuestionSetId() {
        HttpSession session = getSession();
        session.removeAttribute("currentQuestionSetId");
        log.debug("Cleared current question set ID");
    }
}
