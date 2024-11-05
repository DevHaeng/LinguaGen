package com.linguagen.backend.service;

import com.linguagen.backend.dto.GradeDTO;
import com.linguagen.backend.entity.Grade;
import com.linguagen.backend.repository.GradeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GradeService {

    private final GradeRepository gradeRepository;

    @Autowired
    public GradeService(GradeRepository gradeRepository) {
        this.gradeRepository = gradeRepository;
    }

    public GradeDTO getGradeByUserId(String userId) {
        return gradeRepository.findGradeDTOByUserId(userId);
    }

    public GradeDTO updateGrade(GradeDTO gradeDTO) {
        Grade grade = new Grade();
        // DTO에서 엔티티로 데이터 복사
        grade.setIdx(gradeDTO.getIdx());
        grade.setUserId(gradeDTO.getUserId());
        grade.setGrade(gradeDTO.getGrade());
        grade.setTier(gradeDTO.getTier());
        grade.setExp(gradeDTO.getExp());
        grade.setUpdatedAt(gradeDTO.getUpdated_at());

        Grade savedGrade = gradeRepository.save(grade);

        // 저장된 엔티티를 다시 DTO로 변환
        return new GradeDTO(savedGrade.getIdx(), savedGrade.getUserId(),
                savedGrade.getGrade(), savedGrade.getTier(),
                savedGrade.getExp(), savedGrade.getUpdatedAt());
    }

    // 등급과 경험치로 정렬된 모든 사용자 목록 반환
    public List<Grade> getAllUsersByRanking() {
        return gradeRepository.findAllByOrderByGradeAscExpDesc();
    }
}