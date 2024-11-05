package com.linguagen.backend.service;

import com.linguagen.backend.entity.GradeTest;
import com.linguagen.backend.entity.User;
import com.linguagen.backend.repository.GradeTestRepository;
import com.linguagen.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class GradeTestService {

    private final UserRepository userRepository;
    private final GradeTestRepository gradeTestRepository;

    @Autowired
    public GradeTestService(UserRepository userRepository, GradeTestRepository gradeTestRepository) {
        this.userRepository = userRepository;
        this.gradeTestRepository = gradeTestRepository;
    }

    public GradeTest saveGradeTest(String userId, int tempGrade, int tempTier) {
        // User가 존재하는지 확인
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User ID를 찾을 수 없습니다: " + userId));

        // GradeTest 엔티티 생성 및 저장
        GradeTest gradeTest = new GradeTest();
        gradeTest.setUser(user);
        gradeTest.setTempGrade(tempGrade);
        gradeTest.setTempTier(tempTier);
        gradeTest.setStartAt(LocalDateTime.now());

        return gradeTestRepository.save(gradeTest);
    }
}
