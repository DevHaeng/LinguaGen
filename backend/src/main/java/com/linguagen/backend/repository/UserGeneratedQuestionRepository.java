package com.linguagen.backend.repository;

import com.linguagen.backend.entity.AccessLog;
import com.linguagen.backend.entity.Question;
import com.linguagen.backend.entity.UserGeneratedQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserGeneratedQuestionRepository extends JpaRepository<UserGeneratedQuestion, Long> {
    List<UserGeneratedQuestion> findByUserId(String userId);

    @Query("SELECT ugq FROM UserGeneratedQuestion ugq " +
        "JOIN FETCH ugq.question q " +
        "LEFT JOIN FETCH q.choices " +
        "WHERE ugq.userId = :userId")
    List<UserGeneratedQuestion> findByUserIdWithQuestions(@Param("userId") String userId);

    boolean existsByUserIdAndQuestion(String userId, Question question);
}
