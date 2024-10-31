package com.linguagen.backend.controller;


import com.linguagen.backend.dto.UserInterestDTO;
import com.linguagen.backend.entity.User;
import com.linguagen.backend.service.UserInterestService;
import com.linguagen.backend.service.UserService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173" , allowCredentials = "true")  // React와 CORS 문제 해결
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final UserInterestService userInterestService;

    // 생성자 주입
    public UserController(UserService userService, UserInterestService userInterestService) {
        this.userService = userService;
        this.userInterestService = userInterestService;
    }

    // 모든 유저 조회
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return new ResponseEntity<>(users, HttpStatus.OK);
    }

    // ID로 유저 조회
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable("id") String id) {
        User user = userService.getUserById(id);
        if (user != null) {
            return new ResponseEntity<>(user, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    // 유저 생성
    @PostMapping
    public ResponseEntity<User> saveOrUpdateUser(@RequestBody User user) {
        User savedUser = userService.saveOrUpdateUser(user);
        return new ResponseEntity<>(savedUser, HttpStatus.CREATED);
    }



    // 유저 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable String id) {
        userService.deleteUser(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    // 유저 관심사 저장
    @PostMapping("/interests")
    public ResponseEntity<String> saveUserInterests(@RequestBody UserInterestDTO request) {
        try {

            // 디버깅: 요청 데이터 확인
            System.out.println("User ID: " + request.getUserId());
            System.out.println("Interests: " + request.getInterestIdx());

            List<String> interests = request.getInterestIdx();
            String userId = request.getUserId();

            // Service를 통해 관심사 저장 로직 수행
            userInterestService.saveUserInterests(userId, interests);

            return new ResponseEntity<>("관심사 저장 완료", HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>("관심사 저장 실패: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }



    // 로그인
    @PostMapping("/login")
    public String login(@RequestBody User user, HttpSession session) {
        boolean isAuthenticated = userService.login(user, session);
        if (isAuthenticated) {
            return "로그인 성공";
        } else {
            return "로그인 실패: 잘못된 자격 증명";
        }
    }

    // 로그아웃 요청 처리
    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpSession session, HttpServletResponse response) {
        session.invalidate(); // 세션 무효화

        // JSESSIONID 쿠키 삭제
        Cookie cookie = new Cookie("JSESSIONID", null);
        cookie.setPath("/");
        cookie.setHttpOnly(true);
        cookie.setMaxAge(0); // 쿠키 만료 설정
        response.addCookie(cookie);

        return ResponseEntity.ok("로그아웃 되었습니다.");
    }

    // 비밀번호 변경
    @PostMapping("/change-password")
    public ResponseEntity<String> changePassword(@RequestBody User user) {
        boolean isChanged = userService.changePassword(user.getId(), user.getPassword());

        if (isChanged) {
            return ResponseEntity.ok("비밀번호가 성공적으로 변경되었습니다.");
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("비밀번호 변경에 실패했습니다.");
        }
    }

    // 전화번호 변경
    @PostMapping("/change-tell")
    public ResponseEntity<String> changeTellNumber(@RequestBody User user) {
        boolean isChanged = userService.changeTellNumber(user.getId(), user.getTell());

        if (isChanged) {
            return ResponseEntity.ok("전화번호가 성공적으로 변경되었습니다.");
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("전화번호 변경에 실패했습니다.");
        }
    }
}
