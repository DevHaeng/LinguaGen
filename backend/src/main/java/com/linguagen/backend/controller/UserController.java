package com.linguagen.backend.controller;


import com.linguagen.backend.dto.GradeTestDTO;
import com.linguagen.backend.dto.UserInterestDTO;
import com.linguagen.backend.entity.User;
import com.linguagen.backend.service.GradeTestService;
import com.linguagen.backend.service.UserInterestService;
import com.linguagen.backend.service.UserService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Value;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Value("${file.upload-dir}")
    private String uploadDir;

    private final UserService userService;
    private final UserInterestService userInterestService;
    private final GradeTestService gradeTestService;

    // 생성자 주입
    public UserController(UserService userService, UserInterestService userInterestService, GradeTestService gradeTestService) {
        this.userService = userService;
        this.userInterestService = userInterestService;
        this.gradeTestService = gradeTestService;
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

    // 유저 임시 등급 저장
    @PostMapping("/gradeTest")
    public ResponseEntity<String> saveTemporaryGrade(@RequestBody GradeTestDTO gradeData) {
        // 데이터 검증용 로그
        System.out.println("Received userId: " + gradeData.getUserId());
        System.out.println("Received tempGrade: " + gradeData.getTempGrade());
        System.out.println("Received tempTier: " + gradeData.getTempTier());

        try {
            // 기존 로직
            String userId = gradeData.getUserId();
            Integer tempGrade = gradeData.getTempGrade();
            Integer tempTier = gradeData.getTempTier();

            gradeTestService.saveGradeTest(userId, tempGrade, tempTier);
            return ResponseEntity.status(HttpStatus.CREATED).body("임시 등급 정보가 저장되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("임시 등급 정보 저장에 실패했습니다: " + e.getMessage());
        }
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

    // 특정 유저의 picture 값을 반환하는 API 엔드포인트
    @GetMapping("/picture/{id}")
    public ResponseEntity<Map<String, String>> getUserPicture(@PathVariable("id") String id) {
        try {
            String pictureUrl = userService.getUserPicture(id);
            Map<String, String> response = Map.of("profileImageUrl", pictureUrl); // JSON 객체로 반환
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "사용자를 찾을 수 없습니다."));
        }
    }

    //이미지 업로드 기능
    @PostMapping("/upload-profile-image/{id}")
    public ResponseEntity<String> uploadProfileImage(
            @PathVariable String id,
            @RequestParam("file") MultipartFile file) {
        try {
            String imageUrl = userService.uploadProfileImage(id,file);
            return ResponseEntity.ok(imageUrl);
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("파일 업로드 실패: " + e.getMessage());
        }
    }
}
