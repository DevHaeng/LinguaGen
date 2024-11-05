package com.linguagen.backend.controller;

import com.linguagen.backend.dto.CommentDTO;
import com.linguagen.backend.entity.StudentAnswer;
import com.linguagen.backend.service.CommentService;
import com.linguagen.backend.service.StudentAnswerService;
import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/api/answers")
public class StudentAnswerController {

    private final StudentAnswerService studentAnswerService;

    public StudentAnswerController(StudentAnswerService studentAnswerService) {
        this.studentAnswerService = studentAnswerService;
    }

    @PostMapping("/submit")
    public ResponseEntity<StudentAnswer> submitAnswer(@RequestBody AnswerRequest answerRequest) {
        StudentAnswer savedAnswer = studentAnswerService.saveStudentAnswer(
            answerRequest.getIdx(),
            answerRequest.getStudentId(),
            answerRequest.getStudentAnswer()
        );
        return new ResponseEntity<>(savedAnswer, HttpStatus.CREATED);
    }
}

// AnswerRequest 클래스는 답안 제출을 위한 요청 데이터를 담습니다.
@Data
class AnswerRequest {
    // Setter 메서드들
    // Getter 메서드들이 필드 값을 반환하도록 수정
    private Long idx;
    private String studentId;
    private String studentAnswer;

}
