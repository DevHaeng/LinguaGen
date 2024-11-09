package com.linguagen.backend.controller;

import com.linguagen.backend.dto.RankingLogDTO;
import com.linguagen.backend.entity.WeeklyGradeRanking;
import com.linguagen.backend.entity.WeeklyOverallRanking;
import com.linguagen.backend.service.RankingLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/ranking")
public class RankingController {

    @Autowired
    private RankingLogService service;
    
    // 개인 랭킹 조회 (등급을 기준으로 필터링 가능)
    @GetMapping("/personal")
    public List<RankingLogDTO> getPersonalRanking(@RequestParam(name = "grade", required = false, defaultValue = "0") int grade) {
        return service.getPersonalRanking(grade);
    }

    // 주간 랭킹 전체 조회
    @GetMapping("/weekly-overall")
    public List<WeeklyOverallRanking> getWeeklyOverallRanking() {
        return service.getWeeklyOverallRanking();
    }

    // 주간 랭킹 등급별 조회
    @GetMapping("/weekly-grade")
    public List<WeeklyGradeRanking> getWeeklyGradeRanking() {
        return service.getWeeklyGradeRanking();
    }

}
