package com.linguagen.backend.controller;

import com.linguagen.backend.dto.DailyPlayCountDto;
import com.linguagen.backend.dto.LatestStudyInfoDto;
import com.linguagen.backend.service.DashBoardService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/study-log")
public class DashBoardController {

    private final DashBoardService dashBoardService;

    public DashBoardController(DashBoardService dashBoardService) {
        this.dashBoardService = dashBoardService;
    }

    @GetMapping("/latest/{studentId}")  // 엔드포인트의 변수명 변경
    public ResponseEntity<LatestStudyInfoDto> getLatestStudyInfo(@PathVariable("studentId") String studentId) {
        LatestStudyInfoDto latestStudyInfo = dashBoardService.getLatestStudyInfo(studentId);
        if (latestStudyInfo != null) {
            return ResponseEntity.ok(latestStudyInfo);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    @GetMapping("/daily-plays/{studentId}")
    public ResponseEntity<List<DailyPlayCountDto>> getDailyPlayCounts(@PathVariable("studentId") String studentId) {
        List<DailyPlayCountDto> dailyPlayCounts = dashBoardService.getDailyPlayCounts(studentId);
        return ResponseEntity.ok(dailyPlayCounts);
    }

    // 특정 회원의 게임 진행 수 반환 API
    @GetMapping("/game-count/{studentId}")
    public Long getGameCount(@PathVariable("studentId") String studentId) {
        return dashBoardService.getGameCountByStudentId(studentId);
    }

    // 정답률 반환
    @GetMapping("/average-correct-rate/{studentId}")
    public ResponseEntity<Double> getAverageCorrectRate(@PathVariable("studentId") String studentId) {
        Double averageCorrectRate = dashBoardService.getAverageCorrectRateByStudentId(studentId);

        if (averageCorrectRate == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(averageCorrectRate);
    }

    // 이번주 학습한 요일 반환
    @GetMapping("/this-week/{studentId}")
    public ResponseEntity<List<String>> getStudyLogThisWeek(@PathVariable("studentId") String studentId) {
        List<String> studyDays = dashBoardService.getStudyDaysThisWeekByStudentId(studentId);
        return ResponseEntity.ok(studyDays);
    }

    public static class StudyLogResponse {
        private boolean studiedThisWeek;

        public StudyLogResponse(boolean studiedThisWeek) {
            this.studiedThisWeek = studiedThisWeek;
        }

        public boolean isStudiedThisWeek() {
            return studiedThisWeek;
        }

        public void setStudiedThisWeek(boolean studiedThisWeek) {
            this.studiedThisWeek = studiedThisWeek;
        }


    }

}