package com.linguagen.backend.repository;

import com.linguagen.backend.dto.DailyPlayCountDto;
import com.linguagen.backend.entity.StudentAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface StudentAnswerRepository extends JpaRepository<StudentAnswer, Long> {
    Optional<StudentAnswer> findTopByStudentIdOrderByCreatedAtDesc(String studentId);  // studentId를 사용

    @Query("SELECT new com.linguagen.backend.dto.DailyPlayCountDto(DATE(s.createdAt), COUNT(s)) " +
            "FROM StudentAnswer s " +
            "WHERE s.studentId = :studentId " +
            "GROUP BY DATE(s.createdAt)")
    List<DailyPlayCountDto> findDailyPlayCountsByStudentId(@Param("studentId") String studentId);

    Long countByStudentId(String studentId);

    // 특정 회원의 평균 정답률을 계산하는 메서드
    @Query("SELECT (SUM(CASE WHEN s.isCorrect = true THEN 1 ELSE 0 END) * 1.0 / COUNT(s)) "
            + "FROM StudentAnswer s WHERE s.studentId = :studentId")
    Double findAverageCorrectRateByStudentId(@Param("studentId") String studentId);



    // 이번주 학습한 요일 출력
    List<StudentAnswer> findByStudentIdAndCreatedAtBetween(String studentId, LocalDateTime startDate, LocalDateTime endDate);




}


