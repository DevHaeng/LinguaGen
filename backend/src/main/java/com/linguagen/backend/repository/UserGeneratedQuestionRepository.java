package com.linguagen.backend.repository;

import com.linguagen.backend.entity.UserGeneratedQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface UserGeneratedQuestionRepository extends JpaRepository<UserGeneratedQuestion, Long> {

    // 새로운 쿼리 추가
    @Query("SELECT DISTINCT q.setId, COUNT(q) as count FROM UserGeneratedQuestion q " +
        "WHERE q.userId.id = :userId GROUP BY q.setId")
    List<Object[]> findSetStatsByUserId(@Param("userId") String userId);

    // 기존 쿼리 수정
    @Query("SELECT q FROM UserGeneratedQuestion q " +
        "LEFT JOIN FETCH q.choices " +
        "WHERE q.setId = :setId AND q.userId.id = :userId " +
        "ORDER BY q.questionOrder")
    List<UserGeneratedQuestion> findBySetIdAndUserId(
        @Param("setId") String setId,
        @Param("userId") String userId
    );

    // userId 필드를 User의 id로 참조하여 접근합니다
    // Repository 쿼리도 수정
    @Query("SELECT q FROM UserGeneratedQuestion q " +
        "LEFT JOIN FETCH q.choices " +
        "WHERE q.userId.id = :userId AND q.setId IS NOT NULL " +
        "ORDER BY q.createdAt DESC")
    List<UserGeneratedQuestion> findByUserIdWithChoices(@Param("userId") String userId);

    @Query("SELECT MAX(q.idx) FROM UserGeneratedQuestion q")
    Long findLastQuestionIdx();

    @Query("SELECT q FROM UserGeneratedQuestion q " +
        "LEFT JOIN FETCH q.choices " +
        "WHERE q.setId = :setId " +
        "ORDER BY q.questionOrder")
    List<UserGeneratedQuestion> findBySetId(@Param("setId") String setId);

    @Query("SELECT COUNT(q) FROM UserGeneratedQuestion q WHERE q.setId = :setId")
    int countBySetId(@Param("setId") String setId);

    @Query("SELECT q FROM UserGeneratedQuestion q LEFT JOIN FETCH q.choices WHERE q.setId = :setId ORDER BY q.questionOrder")
    List<UserGeneratedQuestion> findBySetIdOrderByQuestionOrder(@Param("setId") String setId);
}
