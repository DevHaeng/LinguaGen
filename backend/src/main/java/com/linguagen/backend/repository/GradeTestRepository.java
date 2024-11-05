package com.linguagen.backend.repository;

import com.linguagen.backend.entity.GradeTest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GradeTestRepository extends JpaRepository<GradeTest, Long> {
}
