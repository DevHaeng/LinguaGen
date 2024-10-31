package com.linguagen.backend.controller;

import com.linguagen.backend.dto.GradeDTO;
import com.linguagen.backend.entity.Grade;
import com.linguagen.backend.service.GradeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/grade")
@CrossOrigin(origins = "http://localhost:5173" , allowCredentials = "true")
public class GradeController {

    private final GradeService gradeService;

    @Autowired
    public GradeController(GradeService gradeService) {
        this.gradeService = gradeService;
    }

    @GetMapping("/{userId}")
    public ResponseEntity<GradeDTO> getGrade(@PathVariable("userId") String userId) {
        GradeDTO gradeDTO = gradeService.getGradeByUserId(userId);
        if (gradeDTO != null) {
            return ResponseEntity.ok(gradeDTO);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/update")
    public ResponseEntity<GradeDTO> updateGrade(@RequestBody GradeDTO gradeDTO) {
        GradeDTO updatedGrade = gradeService.updateGrade(gradeDTO);
        return ResponseEntity.ok(updatedGrade);
    }

    //    // 등급과 경험치로 정렬된 모든 사용자 목록을 반환하는 API
    @GetMapping("/all")
    public List<Grade> getAllUsersWithRank() {
        return gradeService.getAllUsersByRanking();
    }
}