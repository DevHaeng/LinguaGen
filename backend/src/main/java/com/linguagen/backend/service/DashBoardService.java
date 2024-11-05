package com.linguagen.backend.service;

import com.linguagen.backend.dto.DailyPlayCountDto;
import com.linguagen.backend.dto.LatestStudyInfoDto;
import com.linguagen.backend.entity.Question;
import com.linguagen.backend.entity.StudentAnswer;
import com.linguagen.backend.repository.StudentAnswerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class DashBoardService {

    private final StudentAnswerRepository studentAnswerRepository;

    @Autowired
    public DashBoardService(StudentAnswerRepository studentAnswerRepository) {
        this.studentAnswerRepository = studentAnswerRepository;
    }

    public LatestStudyInfoDto getLatestStudyInfo(String studentId) {  // userId를 studentId로 변경
        // 사용자의 가장 최근 학습 로그를 가져옵니다.
        Optional<StudentAnswer> latestLogOpt = studentAnswerRepository.findTopByStudentIdOrderByCreatedAtDesc(studentId);
        if (latestLogOpt.isPresent()) {
            StudentAnswer latestLog = latestLogOpt.get();

            // StudentAnswer에서 직접 Question 정보를 가져옵니다.
            Question question = latestLog.getQuestion();

            // DTO에 필요한 정보 설정
            return new LatestStudyInfoDto(
                    question.getType(),
                    question.getDiffGrade(),
                    question.getDiffTier()
            );
        }
        return null; // 로그나 문제가 없는 경우
    }

    public List<DailyPlayCountDto> getDailyPlayCounts(String studentId) {
        return studentAnswerRepository.findDailyPlayCountsByStudentId(studentId);
    }

    // 특정 studentId에 대한 게임 진행 수 반환
    public Long getGameCountByStudentId(String studentId) {
        return studentAnswerRepository.countByStudentId(studentId);
    }

    // 정답률 반환
    public Double getAverageCorrectRateByStudentId(String studentId) {
        return studentAnswerRepository.findAverageCorrectRateByStudentId(studentId);
    }

    public List<String> getStudyDaysThisWeekByStudentId(String studentId) {
        LocalDateTime startOfWeek = LocalDate.now().with(java.time.DayOfWeek.MONDAY).atStartOfDay();
        LocalDateTime endOfWeek = startOfWeek.plusDays(6).withHour(23).withMinute(59).withSecond(59);
        List<StudentAnswer> studyLogs = studentAnswerRepository.findByStudentIdAndCreatedAtBetween(studentId, startOfWeek, endOfWeek);
        return studyLogs.stream()
                .map(studyLog -> studyLog.getCreatedAt().getDayOfWeek().toString())
                .distinct()
                .collect(Collectors.toList());
    }
}
