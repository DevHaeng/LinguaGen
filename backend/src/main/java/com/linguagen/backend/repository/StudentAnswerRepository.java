package com.linguagen.backend.repository;

import com.linguagen.backend.dto.*;
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
    List<StudentAnswer> findBySessionIdentifierOrderByQuestionOrder(String sessionIdentifier);

    @Query("SELECT COUNT(sa) FROM StudentAnswer sa " +
        "WHERE sa.sessionIdentifier = :sessionId AND sa.isCorrect = 1")
    long countCorrectAnswersBySession(@Param("sessionId") String sessionId);

    long countBySessionIdentifier(String sessionIdentifier);

    boolean existsBySessionIdentifierAndQuestionOrder(String sessionIdentifier, Integer questionOrder);
    // 이 메서드만 수정
    @Query("SELECT sa.sessionIdentifier FROM StudentAnswer sa " +
        "WHERE sa.studentId = :studentId " +
        "ORDER BY sa.createdAt DESC LIMIT 1")
    Optional<String> findFirstSessionIdentifierByStudentIdOrderByCreatedAtDesc(@Param("studentId") String studentId);

    Optional<StudentAnswer> findBySessionIdentifierAndQuestionOrder(
        String sessionIdentifier,
        Integer questionOrder
    );

    // 기존의 통계 관련 메서드들 유지
    Optional<StudentAnswer> findTopByStudentIdOrderByCreatedAtDesc(String studentId);

    @Query("SELECT new com.linguagen.backend.dto.DailyPlayCountDto(DATE(s.createdAt), COUNT(DISTINCT s.sessionIdentifier)) " +
            "FROM StudentAnswer s " +
            "WHERE s.studentId = :studentId " +
            "GROUP BY DATE(s.createdAt)")
    List<DailyPlayCountDto> findDailyPlayCountsByStudentId(@Param("studentId") String studentId);



    // 기존의 통계 관련 메서드들 유지

    @Query("SELECT COUNT(DISTINCT sa.sessionIdentifier) FROM StudentAnswer sa WHERE sa.studentId = :studentId")
    Long getGameCountByStudentId(@Param("studentId") String studentId);

    // 특정 회원의 평균 정답률을 계산하는 메서드
    @Query("SELECT (SUM(CASE WHEN s.isCorrect = 1 THEN 1 ELSE 0 END) * 1.0 / COUNT(s)) "
            + "FROM StudentAnswer s WHERE s.studentId = :studentId")
    Double findAverageCorrectRateByStudentId(@Param("studentId") String studentId);

    // 이번주 학습한 요일 출력
    List<StudentAnswer> findByStudentIdAndCreatedAtBetween(String studentId, LocalDateTime startDate, LocalDateTime endDate);

    // 틀린 세부 유형 비율 출력
    @Query("SELECT new com.linguagen.backend.dto.IncorrectTypePercentageDto(sa.question.detailType, COUNT(sa)) " +
            "FROM StudentAnswer sa " +
            "WHERE sa.studentId = :studentId AND sa.isCorrect = 0 " +
            "GROUP BY sa.question.detailType " +
            "ORDER BY COUNT(sa) DESC")
    List<IncorrectTypePercentageDto> findIncorrectDetailTypeCountsByStudentId(@Param("studentId") String studentId);

    // 지난 7일간 정답을 가장 많이 맞춘 전체 사용자 목록을 가져오기
    @Query("SELECT sa.studentId, COUNT(sa) AS correctAnswers, MIN(sa.createdAt) AS firstCorrectDate " +
            "FROM StudentAnswer sa " +
            "WHERE sa.isCorrect = 1 AND sa.createdAt >= :fromDate " +
            "GROUP BY sa.studentId " +
            "ORDER BY correctAnswers DESC, firstCorrectDate ASC")
    List<Object[]> findTopUsersByCorrectAnswers(LocalDateTime fromDate);

    // 지난 7일간 정답을 가장 많이 맞춘 등급별 사용자 목록을 가져오기
    @Query("SELECT sa.studentId, g.grade, COUNT(sa) AS correctAnswers, MIN(sa.createdAt) AS firstCorrectDate " +
            "FROM StudentAnswer sa " +
            "JOIN User u ON sa.studentId = u.id " +
            "JOIN Grade g ON u.id = g.userId " +
            "WHERE sa.isCorrect = 1 AND sa.createdAt >= :fromDate " +
            "GROUP BY g.grade, sa.studentId " +
            "ORDER BY g.grade DESC, correctAnswers DESC, firstCorrectDate ASC")
    List<Object[]> findTopUsersByGradeAndCorrectAnswers(LocalDateTime fromDate);

    // 학습 날짜, 경험치, 학습 일자 가져오기
    @Query("SELECT new com.linguagen.backend.dto.MyPageDTO(" +
            "s.sessionIdentifier, " +
            "DATE(s.createdAt), " + // DATE()를 사용하여 년-월-일로 변환
            "COUNT(s), " +
            "SUM(CASE WHEN s.isCorrect = 1 THEN 1 ELSE 0 END), " +
            "COALESCE(SUM(s.score), 0)) " +
            "FROM StudentAnswer s " +
            "WHERE s.studentId = :studentId " +
            "GROUP BY s.sessionIdentifier, DATE(s.createdAt) " +
            "ORDER BY MAX(s.createdAt) DESC") // 가장 최신 createdAt 기준 내림차순 정렬
    List<MyPageDTO> findMyPageSummaries(@Param("studentId") String studentId);



    // 학습한 타입, 등급, 티어 가져오기
    @Query("SELECT new com.linguagen.backend.dto.QuestionDTO(sa.sessionIdentifier, q.type, q.diffGrade, q.diffTier) " +
            "FROM StudentAnswer sa " +
            "JOIN sa.question q " +
            "WHERE sa.studentId = :studentId")
    List<QuestionDTO> findQuestionsByStudentId(@Param("studentId") String studentId);

    
    //주간랭킹(주간 score 합 반환)
    @Query("SELECT new com.linguagen.backend.dto.WeeklyRankingDTO(sa.studentId, SUM(sa.score), g.grade) " +
            "FROM StudentAnswer sa " +
            "JOIN Grade g ON sa.studentId = g.userId " +
            "WHERE sa.createdAt BETWEEN :startOfWeek AND :endOfWeek " +
            "GROUP BY sa.studentId, g.grade " +
            "ORDER BY SUM(sa.score) DESC")
    List<WeeklyRankingDTO> findWeeklyRanking(@Param("startOfWeek") LocalDateTime startOfWeek,
                                             @Param("endOfWeek") LocalDateTime endOfWeek);



}


