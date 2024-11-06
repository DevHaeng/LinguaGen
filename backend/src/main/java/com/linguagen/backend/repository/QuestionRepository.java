package com.linguagen.backend.repository;

import com.linguagen.backend.entity.Question;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {
    @Query("SELECT DISTINCT q FROM Question q LEFT JOIN FETCH q.choices")
    List<Question> findAllWithChoices();

    @Query("SELECT DISTINCT q FROM Question q LEFT JOIN FETCH q.choices WHERE q.type = :type")
    List<Question> findByTypeWithChoices(@Param("type") String type);

    @Query("SELECT DISTINCT q FROM Question q LEFT JOIN FETCH q.choices " +
        "WHERE q.diffGrade = :grade AND q.diffTier = :tier")
    List<Question> findByDiffGradeAndDiffTierWithChoices(
        @Param("grade") Byte grade,
        @Param("tier") Byte tier);

    @Query("SELECT DISTINCT q FROM Question q LEFT JOIN FETCH q.choices WHERE q.interest = :interest")
    List<Question> findByInterestWithChoices(@Param("interest") String interest);

    @Query(value = "SELECT * FROM question ORDER BY RAND() LIMIT :count", nativeQuery = true)
    List<Question> findRandomQuestions(@Param("count") int count);

    @Query("SELECT q FROM Question q LEFT JOIN FETCH q.choices WHERE q.idx = :idx")
    Optional<Question> findByIdWithChoices(@Param("idx") Long idx);

    // 특정 난이도의 랜덤 문제를 count개 만큼 가져오는 쿼리
    @Query(value = "SELECT * FROM question WHERE diff_grade = :grade AND diff_tier = :tier ORDER BY RAND() LIMIT :count",
        nativeQuery = true)
    List<Question> findRandomQuestionsByDifficulty(
        @Param("grade") Byte grade,
        @Param("tier") Byte tier,
        @Param("count") int count
    );

    @Query("SELECT MAX(q.idx) FROM Question q")
    Long findLastQuestionIdx();

    // 같은 등급과 티어 문제 조회
    @Query("SELECT q FROM Question q WHERE q.diffGrade = :grade AND q.diffTier = :tier ORDER BY q.diffTier DESC")
    List<Question> findByDiffGradeAndDiffTierWithChoices(@Param("grade") Byte grade, @Param("tier") Byte tier, Pageable pageable);

    // 낮은 문제 조회 (현재 등급과 티어보다 낮은 문제)
    @Query("SELECT q FROM Question q WHERE (q.diffGrade = :grade AND q.diffTier > :tier) OR (q.diffGrade < :grade) ORDER BY q.diffGrade DESC, q.diffTier ASC")
    List<Question> findLowerQuestions(@Param("grade") Byte grade, @Param("tier") Byte tier, Pageable pageable);

    // 같은 등급 문제 조회 (현재 등급과 티어에 일치하는 문제)
    @Query("SELECT q FROM Question q WHERE q.diffGrade = :grade AND q.diffTier = :tier ORDER BY FUNCTION('RAND')")
    List<Question> findSameGradeQuestions(@Param("grade") Byte grade, @Param("tier") Byte tier, Pageable pageable);

    // 높은 문제 조회 (현재 등급과 티어보다 높은 문제)
    @Query("SELECT q FROM Question q WHERE (q.diffGrade = :grade AND q.diffTier < :tier) OR (q.diffGrade > :grade) ORDER BY q.diffGrade ASC, q.diffTier DESC")
    List<Question> findHigherQuestions(@Param("grade") Byte grade, @Param("tier") Byte tier, Pageable pageable);










}
