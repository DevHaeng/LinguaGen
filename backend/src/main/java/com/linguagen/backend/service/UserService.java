package com.linguagen.backend.service;



import com.linguagen.backend.entity.PointLog;
import com.linguagen.backend.entity.User;
import com.linguagen.backend.repository.PointLogRepository;
import com.linguagen.backend.repository.UserRepository;
import com.linguagen.backend.util.SessionUtil;
import jakarta.servlet.http.HttpSession;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PointLogRepository pointLogRepository;

    // 생성자 주입
    public UserService(UserRepository userRepository, PointLogRepository pointLogRepository) {
        this.userRepository = userRepository;
        this.pointLogRepository = pointLogRepository;
    }

    // 모든 유저 조회
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // ID로 유저 조회
    public User getUserById(String id) {
        return userRepository.findById(id).orElse(null);
    }

    // 유저 생성 또는 업데이트
    @Transactional
    public User saveOrUpdateUser(User user) {
        // 유효성 검사 예시
        if (user.getId() == null || user.getPassword() == null ) {
            throw new IllegalArgumentException("필수 필드가 누락되었습니다.");
        }

        // 중복 ID 검사
        if (userRepository.existsById(user.getId())) {
            throw new IllegalArgumentException("이미 존재하는 아이디입니다.");
        }

        return userRepository.save(user);
    }

    // 유저 삭제
    @Transactional
    public void deleteUser(String id) {
        userRepository.deleteById(id);
    }

    // User 객체를 사용하여 로그인 처리
    public Optional<User> login(User user) {
        // DB에서 사용자를 조회
        Optional<User> optionalUser = userRepository.findByIdAndPassword(user.getId(), user.getPassword());

        // 로그인 성공 시 세션에 사용자 정보 저장
        if (optionalUser.isPresent()) {
            User loggedInUser = optionalUser.get();

            // 세션에 사용자 정보 저장
            SessionUtil.setCurrentUserId(loggedInUser.getId());
            SessionUtil.setAttribute("nickname", loggedInUser.getNickname());
            SessionUtil.setAttribute("tell", loggedInUser.getTell());
            SessionUtil.setAttribute("address", loggedInUser.getAddress());
            SessionUtil.setAttribute("points", loggedInUser.getPoints());
            SessionUtil.setAttribute("plan", loggedInUser.getPlan());
            SessionUtil.setAttribute("fatigue", loggedInUser.getFatigue());
        }

        return optionalUser;
    }



    // 비번 변경
    @Transactional
    public boolean changePassword(String userId, String newPassword) {
        // ID가 String이므로 findById에 문자열로 전달
        User user = userRepository.findById(userId).orElseThrow(() ->
                new IllegalArgumentException("해당 사용자를 찾을 수 없습니다.")
        );

        user.setPassword(newPassword);  // 비밀번호 변경
        userRepository.save(user);  // 변경 사항 저장
        return true;
    }

    // 전번 변경
    @Transactional
    public boolean changeTellNumber(String id, String newTell) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        user.setTell(newTell);  // 전화번호 업데이트
        userRepository.save(user);  // 변경 사항 저장
        return true;
    }

    // 로그아웃 로직: 세션 무효화
    public void logout(HttpSession session) {
        session.invalidate();  // 세션 무효화
    }

    // 포인트 업데이트
    @Transactional
    public void updateUserPoints(String userId, int changeAmount, String changeType) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        int newBalance = user.getPoints() + changeAmount;
        user.setPoints(newBalance);
        userRepository.save(user);

        PointLog pointLog = new PointLog();
        pointLog.setUser(user);
        pointLog.setChangeAmount(changeAmount);
        pointLog.setNewBalance(newBalance);
        pointLog.setChangeType(changeType);
        pointLogRepository.save(pointLog);
    }

    //프로필 이미지 url 반환
    public String getUserPicture(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getPicture();
    }

    //프로필 이미지 업로드
    public String uploadProfileImage(String userId, MultipartFile file) throws IOException {

        // 프로젝트의 절대 경로를 가져와서 static/uploads에 저장
        String projectDir = System.getProperty("user.dir");
        String uploadDir = projectDir + "/backend/src/main/resources/static/uploads";

        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path filePath = Paths.get(uploadDir, fileName);

        try {
            // 디렉토리가 존재하지 않으면 생성
            Files.createDirectories(filePath.getParent());
            file.transferTo(filePath.toFile());

            // 업로드된 파일의 상대 경로 생성
            String fileUrl = "/uploads/" + fileName;

            // userId로 사용자 조회 후 프로필 이미지 URL 업데이트
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));

            user.setPicture(fileUrl);
            userRepository.save(user); // URL 업데이트된 사용자 정보 저장
            return fileUrl; // 저장된 파일의 URL 반환

        } catch (IOException e) {
            e.printStackTrace(); // 예외 메시지를 서버 로그에 출력
            throw new IOException("파일 업로드 실패: " + e.getMessage(), e);
        }
    }

    public void updateUserPlanToPro(String userId) {
        userRepository.updatePlan(userId, "pro");
    }

    // 사용자의 피로도 반환
    public int getUserFatigue(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getFatigue();
    }

    // 사용자의 포인트 반환
    public int getUserPoints(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getPoints(); // User 엔티티의 points 필드 반환
    }
}
