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

    // 높은 난이도 문제 선택 로직 수정
    private List<Question> getHigherLevelQuestions(byte grade, byte tier, Pageable pageable) {
        List<Question> higherQuestions = new ArrayList<>();

        if (grade == 1 && tier == 4) {
            // 브론즈 4의 경우 브론즈 3만 가져오기
            return questionRepository.findByDiffGradeAndDiffTierWithChoices(
                (byte)1,
                (byte)3,
                pageable
            );
        }

        if (tier == 1) {
            // 현재 티어가 1이면 다음 등급의 4티어로
            if (grade < 6) {  // 챌린저가 아닌 경우
                return questionRepository.findByDiffGradeAndDiffTierWithChoices(
                    (byte)(grade + 1),
                    (byte)4,
                    pageable
                );
            }
        } else {
            // 같은 등급의 한 단계 높은 티어
            return questionRepository.findByDiffGradeAndDiffTierWithChoices(
                grade,
                (byte)(tier - 1),
                pageable
            );
        }

        return higherQuestions;
    }

    // 낮은 난이도 문제 선택 로직 수정
    private List<Question> getLowerLevelQuestions(byte grade, byte tier, Pageable pageable) {
        List<Question> lowerQuestions = new ArrayList<>();

        if (grade == 1 && tier == 4) {
            // 브론즈 4는 lower가 없음
            return lowerQuestions;
        }

        if (tier == 4) {
            // 현재 티어가 4면 이전 등급의 1티어로
            if (grade > 1) {  // 브론즈가 아닌 경우
                return questionRepository.findByDiffGradeAndDiffTierWithChoices(
                    (byte)(grade - 1),
                    (byte)1,
                    pageable
                );
            }
        } else {
            // 같은 등급의 한 단계 낮은 티어
            return questionRepository.findByDiffGradeAndDiffTierWithChoices(
                grade,
                (byte)(tier + 1),
                pageable
            );
        }

        return lowerQuestions;
    }

    public List<QuestionDTO> getQuestionsInOrder(Byte grade, Byte tier) {
        final int TOTAL_QUESTIONS = 15;
        final int QUESTIONS_PER_DIFFICULTY = 5;
        Pageable pageable = PageRequest.of(0, QUESTIONS_PER_DIFFICULTY * 2);

        // 현재 등급/티어 문제
        List<Question> sameGradeQuestions = questionRepository.findSameGradeQuestions(grade, tier, pageable);
        Collections.shuffle(sameGradeQuestions);
        int currentLevelCount = (grade == 1 && tier == 4) ? 10 : QUESTIONS_PER_DIFFICULTY;
        sameGradeQuestions = new ArrayList<>(sameGradeQuestions.subList(0,
            Math.min(currentLevelCount, sameGradeQuestions.size())));

        // 높은/낮은 난이도 문제 가져오기
        List<Question> higherQuestions = new ArrayList<>(getHigherLevelQuestions(grade, tier, pageable));
        List<Question> lowerQuestions = new ArrayList<>(getLowerLevelQuestions(grade, tier, pageable));

        Collections.shuffle(higherQuestions);
        Collections.shuffle(lowerQuestions);

        // 문제 수 제한
        higherQuestions = new ArrayList<>(higherQuestions.subList(0,
            Math.min(QUESTIONS_PER_DIFFICULTY, higherQuestions.size())));
        lowerQuestions = new ArrayList<>(lowerQuestions.subList(0,
            Math.min(QUESTIONS_PER_DIFFICULTY, lowerQuestions.size())));

        // 문제 배치 로직 (기존과 동일)
        List<Question> finalQuestions = new ArrayList<>();

        if (grade == 1 && tier == 4) {
            // 브론즈 4 특별 배치
            // 1-5번: 적응 구간
            addQuestions(finalQuestions, sameGradeQuestions, 3);    // 적응
            addQuestions(finalQuestions, higherQuestions, 1);       // 첫 도전
            addQuestions(finalQuestions, sameGradeQuestions, 1);    // 회복

            // 6-10번: 중간 도전 구간
            addQuestions(finalQuestions, higherQuestions, 2);       // 연속 도전
            addQuestions(finalQuestions, sameGradeQuestions, 3);    // 회복 및 안정화

            // 11-15번: 마지막 도전 구간
            addQuestions(finalQuestions, sameGradeQuestions, 3);    // HP 확보
            addQuestions(finalQuestions, higherQuestions, 2);       // 마지막 도전
        } else {
            // 일반적인 경우의 배치
            // 1-5번: 초반 도전 구간
            addQuestions(finalQuestions, sameGradeQuestions, 1);    // 워밍업
            addQuestions(finalQuestions, higherQuestions, 2);       // 승급 도전 기회
            addQuestions(finalQuestions, lowerQuestions, 1);        // HP 회복 기회
            addQuestions(finalQuestions, sameGradeQuestions, 1);    // 안정화

            // 6-10번: 중간 회복 구간
            addQuestions(finalQuestions, higherQuestions, 1);       // 승급 도전
            addQuestions(finalQuestions, lowerQuestions, 2);        // HP 회복
            addQuestions(finalQuestions, sameGradeQuestions, 2);    // 안정화

            // 11-15번: 마지막 도전 구간
            addQuestions(finalQuestions, higherQuestions, 2);       // 마지막 승급 도전
            addQuestions(finalQuestions, lowerQuestions, 2);        // HP 회복
            addQuestions(finalQuestions, sameGradeQuestions, 1);    // 마무리
        }

        // 부족한 문제 채우기
        while (finalQuestions.size() < TOTAL_QUESTIONS && !sameGradeQuestions.isEmpty()) {
            finalQuestions.add(sameGradeQuestions.remove(0));
        }

        return finalQuestions.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    private void addQuestions(List<Question> target, List<Question> source, int count) {
        for (int i = 0; i < count && !source.isEmpty(); i++) {
            target.add(source.remove(0));
        }
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

