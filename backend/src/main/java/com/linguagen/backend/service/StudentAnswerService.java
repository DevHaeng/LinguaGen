package com.linguagen.backend.service;

import com.linguagen.backend.entity.StudentAnswer;
import com.linguagen.backend.entity.Question;
import com.linguagen.backend.repository.StudentAnswerRepository;
import com.linguagen.backend.repository.QuestionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class StudentAnswerService {

    private final StudentAnswerRepository studentAnswerRepository;
    private final QuestionRepository questionRepository;

    public StudentAnswerService(StudentAnswerRepository studentAnswerRepository, QuestionRepository questionRepository) {
        this.studentAnswerRepository = studentAnswerRepository;
        this.questionRepository = questionRepository;
    }

    @Transactional
    public StudentAnswer saveStudentAnswer(Long idx, String studentId, String studentAnswer) {
        // Question 객체를 idx를 통해 조회
        Question question = questionRepository.findById(idx)
            .orElseThrow(() -> new IllegalArgumentException("Invalid question ID: " + idx));

        StudentAnswer answer = new StudentAnswer();
        answer.setQuestion(question);  // Question 객체 설정
        answer.setStudentId(studentId);
        answer.setStudentAnswer(studentAnswer);

        return studentAnswerRepository.save(answer); // 데이터가 삽입되면 트리거가 작동
    }


}
