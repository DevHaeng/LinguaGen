package com.linguagen.backend.service;

import com.linguagen.backend.dto.QuestionDTO;
import com.linguagen.backend.entity.Choices;
import com.linguagen.backend.entity.Grade;
import com.linguagen.backend.entity.Question;
import com.linguagen.backend.exception.ResourceNotFoundException;
import com.linguagen.backend.repository.GradeRepository;
import com.linguagen.backend.repository.QuestionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j  // 로깅을 위한 어노테이션 추가
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class QuestionService {
    private final QuestionRepository questionRepository;
    private final GradeRepository gradeRepository;


    // 모든 문제 조회
    public List<QuestionDTO> getAllQuestions() {
        List<Question> questions = questionRepository.findAllWithChoices();
        return questions.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    // 타입별 문제 조회
    public List<QuestionDTO> getQuestionsByType(String type) {
        List<Question> questions = questionRepository.findByTypeWithChoices(type);
        return questions.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    public List<QuestionDTO> getQuestionsForUser(String userId) {
        // 등급과 티어를 가져옴
        Grade grade = gradeRepository.findByUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User grade not found with userId: " + userId));

        Byte userGrade = (byte) grade.getGrade();
        Byte userTier = (byte) grade.getTier();

        // 등급과 티어에 맞는 문제를 순서대로 가져옴
        return getQuestionsInOrder(userGrade, userTier);
    }




    public List<QuestionDTO> getQuestionsInOrder(Byte grade, Byte tier) {
        List<Question> questions = new ArrayList<>();

        // 낮은 문제 2개 조회 (정렬된 순서로 가져오기)
        Pageable lowerPageable = PageRequest.of(0, 10); // 충분한 개수를 가져온 후 섞기
        List<Question> lowerQuestions = questionRepository.findLowerQuestions(grade, tier, lowerPageable);
        Collections.shuffle(lowerQuestions); // 무작위로 섞기
        questions.addAll(lowerQuestions.subList(0, Math.min(2, lowerQuestions.size()))); // 필요한 개수만 추가

        // 같은 등급 문제 6개 (브론즈 4의 경우 8개) 조회
        int sameGradeCount = (grade == 1 && tier == 4) ? 8 : 6;
        Pageable sameGradePageable = PageRequest.of(0, 10); // 충분한 개수를 가져온 후 섞기
        List<Question> sameGradeQuestions = questionRepository.findSameGradeQuestions(grade, tier, sameGradePageable);
        Collections.shuffle(sameGradeQuestions); // 무작위로 섞기
        questions.addAll(sameGradeQuestions.subList(0, Math.min(sameGradeCount, sameGradeQuestions.size())));

        // 높은 문제 2개 조회 (정렬된 순서로 가져오기)
        Pageable higherPageable = PageRequest.of(0, 10); // 충분한 개수를 가져온 후 섞기
        List<Question> higherQuestions = questionRepository.findHigherQuestions(grade, tier, higherPageable);
        Collections.shuffle(higherQuestions); // 무작위로 섞기
        questions.addAll(higherQuestions.subList(0, Math.min(2, higherQuestions.size())));

        return questions.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    // 난이도별 문제 조회
    public List<QuestionDTO> getQuestionsByDifficulty(Byte grade, Byte tier) {
        List<Question> questions = new ArrayList<>();

        Pageable sameTierPageable = (grade == 1 && tier == 4) ? PageRequest.of(0, 8) : PageRequest.of(0, 6);
        List<Question> sameTierQuestions = questionRepository.findByDiffGradeAndDiffTierWithChoices(grade, tier, sameTierPageable);
        questions.addAll(sameTierQuestions);
        log.info("같은 등급과 티어 문제 수: " + sameTierQuestions.size());

        // 낮은 티어 문제 조회
        if (tier < 4) {
            Pageable lowerTierPageable = PageRequest.of(0, 2);
            List<Question> lowerTierQuestions = questionRepository.findByDiffGradeAndDiffTierWithChoices(grade, (byte) (tier + 1), lowerTierPageable);
            questions.addAll(lowerTierQuestions);
            log.info("낮은 티어 문제 수: " + lowerTierQuestions.size());
        } else if (grade > 1) {
            List<Question> lowerTierQuestions = questionRepository.findByDiffGradeAndDiffTierWithChoices((byte) (grade - 1), (byte) 1, PageRequest.of(0, 2));
            questions.addAll(lowerTierQuestions);
            log.info("낮은 등급 문제 수: " + lowerTierQuestions.size());
        }

        // 높은 티어 문제 조회
        if (tier > 1) {
            Pageable higherTierPageable = PageRequest.of(0, 2);
            List<Question> higherTierQuestions = questionRepository.findByDiffGradeAndDiffTierWithChoices(grade, (byte) (tier - 1), higherTierPageable);
            questions.addAll(higherTierQuestions);
            log.info("높은 티어 문제 수: " + higherTierQuestions.size());
        } else if (grade < 6) {
            List<Question> higherTierQuestions = questionRepository.findByDiffGradeAndDiffTierWithChoices((byte) (grade + 1), (byte) 4, PageRequest.of(0, 2));
            questions.addAll(higherTierQuestions);
            log.info("높은 등급 문제 수: " + higherTierQuestions.size());
        }

        return questions.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }




    // 관심사별 문제 조회
    public List<QuestionDTO> getQuestionsByInterest(String interest) {
        List<Question> questions = questionRepository.findByInterestWithChoices(interest);
        return questions.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    // 랜덤 문제 조회
    public List<QuestionDTO> getRandomQuestions(int count) {
        List<Question> questions = questionRepository.findRandomQuestions(count);
        return questions.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    // ID로 단일 문제 조회
    public QuestionDTO getQuestionById(Long idx) {
        Question question = questionRepository.findByIdWithChoices(idx)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Question not found with id: " + idx));
        return convertToDTO(question);
    }

    // Entity를 DTO로 변환
    private QuestionDTO convertToDTO(Question question) {
        QuestionDTO dto = new QuestionDTO();
        dto.setIdx(question.getIdx());
        dto.setType(question.getType());
        dto.setDetailType(question.getDetailType());
        dto.setInterest(question.getInterest());
        dto.setDiffGrade(question.getDiffGrade());
        dto.setDiffTier(question.getDiffTier());
        dto.setQuestionFormat(question.getQuestionFormat());
        dto.setPassage(question.getPassage());
        dto.setQuestion(question.getQuestion());
        dto.setCorrectAnswer(question.getCorrectAnswer());
        dto.setExplanation(question.getExplanation());

        List<QuestionDTO.ChoicesDTO> choicesDTOs = question.getChoices().stream()
            .map(this::convertChoiceToDTO)
            .collect(Collectors.toList());
        dto.setChoices(choicesDTOs);

        return dto;
    }

    // Choice Entity를 DTO로 변환
    private QuestionDTO.ChoicesDTO convertChoiceToDTO(Choices choice) {
        return new QuestionDTO.ChoicesDTO(
            choice.getIdx(),
            choice.getChoiceLabel(),
            choice.getChoiceText()
        );
    }

    public List<QuestionDTO> getQuestionsByDifficultyWithCount(Byte grade, Byte tier, int count) {
        // 해당 난이도의 문제들을 무작위로 count개 만큼 가져옴
        List<Question> questions = questionRepository.findRandomQuestionsByDifficulty(grade, tier, count);
        return questions.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
}

