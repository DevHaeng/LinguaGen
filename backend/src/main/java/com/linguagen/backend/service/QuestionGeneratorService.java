package com.linguagen.backend.service;

import com.linguagen.backend.dto.OpenAIPromptDTO;
import com.linguagen.backend.dto.QuestionDTO;
import com.linguagen.backend.dto.QuestionGenerationRequestDTO;
import com.linguagen.backend.entity.Question;
import com.linguagen.backend.entity.Choices;
import com.linguagen.backend.entity.UserGeneratedQuestion;
import com.linguagen.backend.enums.QuestionType;
import com.linguagen.backend.exception.QuestionParsingException;
import com.linguagen.backend.repository.QuestionRepository;
import com.linguagen.backend.repository.UserGeneratedQuestionRepository;
import jakarta.annotation.PostConstruct;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import lombok.Getter;
import lombok.AllArgsConstructor;

import static java.util.Map.entry;

@Service
@Slf4j
@RequiredArgsConstructor
public class QuestionGeneratorService {
    private final OpenAIService openAIService;
    private final QuestionRepository questionRepository;
    private final UserGeneratedQuestionRepository userGeneratedQuestionRepository;


    @PostConstruct
    private void initialize() {
        // 서비스 시작 시 마지막 인덱스 로깅
        Long lastIdx = questionRepository.findLastQuestionIdx();
        log.info("Last question index in database: {}", lastIdx);
    }

    // CEFR 레벨 매핑 초기화
    private static final Map<String, String> TIER_TO_CEFR = Map.ofEntries(
        entry("브론즈 4티어", "A1 - 초급 단계"),
        entry("브론즈 3티어", "A1+ - 초급 중간 단계"),
        entry("브론즈 2티어", "A2 - 초급 초반 단계"),
        entry("브론즈 1티어", "A2 - 초급 후반 단계"),
        entry("실버 4티어", "A2+ - 초급과 중급 사이"),
        entry("실버 3티어", "B1 - 중급 초반 단계"),
        entry("실버 2티어", "B1 - 중급 중간 단계"),
        entry("실버 1티어", "B1 - 중급 후반 단계"),
        entry("골드 4티어", "B1+ - 중급 발전 단계"),
        entry("골드 3티어", "B2 - 중급 초반 단계"),
        entry("골드 2티어", "B2 - 중급 중간 단계"),
        entry("골드 1티어", "B2 - 중급 후반 단계"),
        entry("플래티넘 4티어", "B2+ - 중급에서 고급 전환 단계"),
        entry("플래티넘 3티어", "C1 - 고급 초반 단계"),
        entry("플래티넘 2티어", "C1 - 고급 중간 단계"),
        entry("플래티넘 1티어", "C1 - 고급 후반 단계"),
        entry("다이아몬드 4티어", "C1+ - 고급에서 매우 고급 전환 단계"),
        entry("다이아몬드 3티어", "C2 - 매우 고급 초반 단계"),
        entry("다이아몬드 2티어", "C2 - 매우 고급 중간 단계"),
        entry("다이아몬드 1티어", "C2 - 매우 고급 후반 단계"),
        entry("챌린저", "C2 - 최고 수준, 원어민과 거의 비슷한 수준")
    );

    @Transactional
    public void generateQuestions(QuestionGenerationRequestDTO request, String userId) {
        log.debug("Starting question generation for request: {} by user: {}", request, userId);

        // 현재 데이터베이스의 마지막 인덱스 확인
        Long lastIdx = questionRepository.findLastQuestionIdx();
        if (lastIdx < 5040) {
            lastIdx = 5040L;
        }
        log.info("Starting question generation from index: {}", lastIdx + 1);

        String tierString = String.format("%s %d티어", request.getGrade(), request.getTier());
        String questionFormat = QuestionType.isWritingSpeakingType(request.getDetailType()) ?
            "short-answer" : determineQuestionFormat(request.getQuestionType(), request.getDetailType());

        try {
            OpenAIPromptDTO prompt = createPrompt(
                request.getTopic(),
                tierString,
                request.getQuestionType(),
                request.getDetailType(),
                questionFormat
            );

            String response = openAIService.getCompletion(prompt.getPrompt());
            Question question = parseResponse(response, prompt, tierString);
            Question savedQuestion = questionRepository.save(question);

            // 사용자 생성 문제 연결 정보 저장
            UserGeneratedQuestion userQuestion = new UserGeneratedQuestion();
            userQuestion.setUserId(userId);
            userQuestion.setQuestion(savedQuestion);
            userGeneratedQuestionRepository.save(userQuestion);

            log.info("Generated question with ID: {} for user: {}", savedQuestion.getIdx(), userId);
        } catch (Exception e) {
            log.error("Error generating question for user: {}", userId, e);
            throw new QuestionParsingException("Failed to generate question: " + e.getMessage());
        }
    }

    // 새로운 메서드 추가
    public List<QuestionDTO> getUserGeneratedQuestions(String userId) {
        List<UserGeneratedQuestion> userQuestions =
            userGeneratedQuestionRepository.findByUserIdWithQuestions(userId);

        return userQuestions.stream()
            .map(ugq -> convertToDTO(ugq.getQuestion()))
            .collect(Collectors.toList());
    }

    // convertToDTO 메서드 추가
    private QuestionDTO convertToDTO(Question question) {
        if (question == null) {
            return null;
        }

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

        if (question.getChoices() != null && !question.getChoices().isEmpty()) {
            List<QuestionDTO.ChoicesDTO> choicesDTOs = question.getChoices().stream()
                .map(choice -> {
                    QuestionDTO.ChoicesDTO choiceDTO = new QuestionDTO.ChoicesDTO();
                    choiceDTO.setIdx(choice.getIdx());
                    choiceDTO.setChoiceLabel(choice.getChoiceLabel());
                    choiceDTO.setChoiceText(choice.getChoiceText());
                    return choiceDTO;
                })
                .collect(Collectors.toList());
            dto.setChoices(choicesDTOs);
        }

        return dto;
    }


    private Question parseResponse(String response, OpenAIPromptDTO prompt, String tier) {
        Question question = new Question();

        // 기본 정보 설정
        question.setType(prompt.getQuestionType());
        question.setDetailType(prompt.getDetailType());
        question.setInterest(prompt.getTopic());
        question.setQuestionFormat(getQuestionFormat(prompt.getQuestionFormat()));

        // 티어 정보 설정
        TierInfo tierInfo = parseTier(tier);
        question.setDiffGrade(tierInfo.getGrade());
        question.setDiffTier(tierInfo.getTier());

        // 정규식 패턴으로 콘텐츠 추출
        extractContent(response, question);

        return question;
    }

    private void extractContent(String response, Question question) {
        // 지문 추출
        Matcher passageMatcher = Pattern.compile("지문:(.*?)(?=질문:)", Pattern.DOTALL).matcher(response);
        if (passageMatcher.find()) {
            question.setPassage(cleanText(passageMatcher.group(1)));
        }

        // 질문 추출
        Matcher questionMatcher = Pattern.compile("질문:(.*?)(?=보기:|정답:)", Pattern.DOTALL).matcher(response);
        if (questionMatcher.find()) {
            question.setQuestion(cleanText(questionMatcher.group(1)));
        }

        // 객관식/주관식 구분하여 처리
        if (question.getQuestionFormat() == Question.QuestionFormat.MULTIPLE_CHOICE) {
            extractMultipleChoiceContent(response, question);
        } else {
            Matcher answerMatcher = Pattern.compile("정답:(.*?)(?=해설:)", Pattern.DOTALL).matcher(response);
            if (answerMatcher.find()) {
                question.setCorrectAnswer(cleanText(answerMatcher.group(1)));
            }
        }

        // 해설 추출
        Matcher explanationMatcher = Pattern.compile("해설:(.*?)$", Pattern.DOTALL).matcher(response);
        if (explanationMatcher.find()) {
            question.setExplanation(cleanText(explanationMatcher.group(1)));
        }
    }

    private void extractMultipleChoiceContent(String response, Question question) {
        log.debug("Starting to extract multiple choice content");
        log.debug("Response content: {}", response);

        // "보기:" 섹션을 먼저 찾기
        String choicesSection = "";
        Pattern choicesSectionPattern = Pattern.compile("보기:.*?(?=정답:|$)", Pattern.DOTALL);
        Matcher sectionMatcher = choicesSectionPattern.matcher(response);
        if (sectionMatcher.find()) {
            choicesSection = sectionMatcher.group();
            log.debug("Found choices section: {}", choicesSection);
        } else {
            log.error("Could not find choices section in response");
            throw new QuestionParsingException("No choices section found in response");
        }

        // 개별 선택지 추출
        List<Choices> choicesList = new ArrayList<>();
        Pattern choicesPattern = Pattern.compile("([A-D])\\s*[.)]\\s*([^A-D]*?)(?=[A-D]\\s*[.)]|$)", Pattern.DOTALL);
        Matcher choicesMatcher = choicesPattern.matcher(choicesSection);

        while (choicesMatcher.find()) {
            String label = choicesMatcher.group(1).trim();
            String text = cleanText(choicesMatcher.group(2));

            log.debug("Extracted choice - Label: {}, Text: {}", label, text);

            Choices choice = new Choices();
            choice.setChoiceLabel(label);
            choice.setChoiceText(text);
            choice.setQuestion(question);
            choicesList.add(choice);
        }

        // 선택지 검증
        if (choicesList.size() != 4) {
            log.error("Invalid number of choices: {}. Expected: 4", choicesList.size());
            log.debug("Current choices: {}", choicesList);
            throw new QuestionParsingException("Invalid number of choices: " + choicesList.size());
        }

        // 선택지 순서 확인 및 설정
        String[] expectedLabels = {"A", "B", "C", "D"};
        for (int i = 0; i < choicesList.size(); i++) {
            Choices choice = choicesList.get(i);
            if (!choice.getChoiceLabel().equals(expectedLabels[i])) {
                log.error("Choice label mismatch at position {}. Expected: {}, Found: {}",
                    i, expectedLabels[i], choice.getChoiceLabel());
                throw new QuestionParsingException("Invalid choice label sequence");
            }
            question.addChoice(choice);
        }

        // 정답 추출
        Pattern answerPattern = Pattern.compile("정답:\\s*([A-D])", Pattern.DOTALL);
        Matcher answerMatcher = answerPattern.matcher(response);
        if (answerMatcher.find()) {
            String answer = answerMatcher.group(1).trim();
            question.setCorrectAnswer(answer);
            log.debug("Set correct answer: {}", answer);
        } else {
            log.error("No correct answer found in response");
            throw new QuestionParsingException("No correct answer found");
        }
    }


    @Data
    @AllArgsConstructor
    private static class TierInfo {
        private Byte grade;
        private Byte tier;
    }

    private TierInfo parseTier(String tierString) {
        Map<String, Byte> gradeMap = Map.of(
            "브론즈", (byte) 1,
            "실버", (byte) 2,
            "골드", (byte) 3,
            "플래티넘", (byte) 4,
            "다이아몬드", (byte) 5,
            "챌린저", (byte) 6
        );

        if (tierString.equals("챌린저")) {
            return new TierInfo((byte) 6, (byte) 0);
        }

        String[] parts = tierString.split(" ");
        String grade = parts[0];
        byte tier = Byte.parseByte(parts[1].replace("티어", ""));

        return new TierInfo(gradeMap.get(grade), tier);
    }

    private Question.QuestionFormat getQuestionFormat(String format) {
        return format.equals("multiple-choice") ?
            Question.QuestionFormat.MULTIPLE_CHOICE :
            Question.QuestionFormat.SHORT_ANSWER;
    }

    private String cleanText(String text) {
        if (text == null) return "";
        return text.trim()
            .replaceAll("\\*+", "")
            .replaceAll("[-~.。、,，:：\\s]+$", "")
            .replaceAll("\\s+", " ")
            .replaceAll("^\\s*[.)]\\s*", "") // 시작 부분의 점이나 괄호 제거
            .trim();
    }

    private OpenAIPromptDTO createPrompt(String topic, String tier, String questionType,
                                         String detailType, String questionFormat) {
        String cefrLevel = TIER_TO_CEFR.get(tier);
        String prompt = buildPrompt(topic, tier, cefrLevel, questionType, detailType, questionFormat);

        OpenAIPromptDTO promptDTO = new OpenAIPromptDTO();
        promptDTO.setTopic(topic);
        promptDTO.setQuestionType(questionType);
        promptDTO.setDetailType(detailType);
        promptDTO.setQuestionFormat(questionFormat);
        promptDTO.setPrompt(prompt);

        return promptDTO;
    }

    private String determineQuestionFormat(String questionType, String detailType) {
        // 말하기, 쓰기 문제는 무조건 주관식
        if (QuestionType.isWritingSpeakingType(detailType)) {
            return "short-answer";
        }
        // 나머지는 70:30 비율로 객관식/주관식 선택
        return new Random().nextDouble() < 0.7 ? "multiple-choice" : "short-answer";
    }

    private String buildPrompt(String topic, String tier, String cefrLevel,
                               String questionType, String detailType, String questionFormat) {
        // 지문 길이 범위 설정
        Map<String, int[]> passageLengthByCEFR = Map.of(
            "A1", new int[]{50, 80},
            "A2", new int[]{70, 100},
            "B1", new int[]{90, 120},
            "B2", new int[]{110, 150},
            "C1", new int[]{130, 180},
            "C2", new int[]{160, 220}
        );

        String cefrKey = cefrLevel.split(" ")[0];
        int[] lengthRange = passageLengthByCEFR.getOrDefault(
            cefrKey,
            new int[]{80, 120} // 기본값
        );

        StringBuilder promptBuilder = new StringBuilder();
        promptBuilder.append(String.format(
            "%s(이)라는 주제에 관하여 유럽연합의 CEFR %s 등급의 %s에 맞춰 **%s 문제**를 1개 만들어 주세요. ",
            topic, cefrLevel, tier,
            questionFormat.equals("multiple-choice") ? "객관식" : "주관식 단답형"
        ));

        promptBuilder.append(String.format(
            "문제 유형은 %s이며, 세부 유형은 '%s'입니다. ",
            questionType, detailType
        ));

        // 문제 구성 요소 지침 추가
        promptBuilder.append(String.format("""
        각 문제에 대해 다음 지침을 따라주세요:
        1. **지문**:
           %d-%d 단어 길이의 **영어 지문**을 제공하세요. %s
        2. **질문**:
           %s
        """,
            lengthRange[0], lengthRange[1],
            questionType.equals("리스닝") ? "A와 B 사이의 자연스러운 대화 형식으로 작성해주세요." : "",
            getQuestionTypeInstruction(detailType)
        ));

        // 객관식/주관식 형식에 따른 추가 지침
        if (questionFormat.equals("multiple-choice")) {
            promptBuilder.append("""
            3. **보기**:
            A. 첫 번째 선택지
            B. 두 번째 선택지
            C. 세 번째 선택지
            D. 네 번째 선택지
            4. **정답**:
               정답 선택지(A, B, C, D 중 하나)를 명시하세요.
            """);
        } else {
            promptBuilder.append("""
            3. **정답**:
               정답은 명확하고 간단한 형태로 제시하세요.
            """);
        }

        // 해설 지침 추가
        promptBuilder.append("""
        5. **해설**:
           다음 내용을 포함하여 **한글로** 상세하게 작성하세요:
             정답이 도출된 근거 설명
             문법 포인트나 어휘 설명 (필요한 경우)
             오답을 피하기 위한 팁
        """);

        // 응답 형식 지침 추가
        promptBuilder.append("""
        
        **아래의 형식을 정확히 따라 작성해주세요:**
        문제:
        지문:
        질문:
        """);

        if (questionFormat.equals("multiple-choice")) {
            promptBuilder.append("""
            보기:
            A. 선택지 A 내용
            B. 선택지 B 내용
            C. 선택지 C 내용
            D. 선택지 D 내용
            """);
        }

        promptBuilder.append("""
        정답:
        해설:
        """);

        return promptBuilder.toString();
    }

    private String getQuestionTypeInstruction(String detailType) {
        Map<String, String> instructions = Map.ofEntries(
            entry("주제/제목 찾기", "지문의 주제나 제목을 묻는 질문을 **한글로** 작성하세요."),
            entry("요지 파악", "지문의 요지를 묻는 질문을 **한글로** 작성하세요."),
            entry("세부 정보 찾기", "지문의 세부 정보를 묻는 질문을 **한글로** 작성하세요."),
            entry("지칭 추론", "지문에서 특정 대명사나 표현이 지칭하는 것을 묻는 질문을 **한글로** 작성하세요."),
            entry("어휘 추론", "지문에서 특정 단어나 구의 의미를 묻는 질문을 **한글로** 작성하세요."),
            entry("주제/목적 파악", "대화나 강의의 주제나 목적을 묻는 질문을 **한글로** 작성하세요."),
            entry("세부 정보 듣기", "대화나 강의에서 언급된 세부 정보를 묻는 질문을 **한글로** 작성하세요."),
            entry("화자의 태도/의견 추론", "화자의 태도나 의견을 추론하는 질문을 **한글로** 작성하세요."),
            entry("대화/강의의 구조 파악", "대화나 강의의 전개 방식이나 구조를 묻는 질문을 **한글로** 작성하세요."),
            entry("함축적 의미 추론", "화자가 직접적으로 말하지 않은 함축적 의미를 추론하는 질문을 **한글로** 작성하세요."),
            entry("문법 문제", "다음 중 **문법적으로 올바른 문장**을 선택하라는 질문을 **한글로** 작성하세요."),
            entry("어휘 문제", "다음 중 **문맥에 가장 적합한 어휘**를 선택하라는 질문을 **한글로** 작성하세요."),
            entry("말하기 문제", "주어진 주제에 대해 **영어로 간단히 말해보세요**."),
            entry("쓰기 문제", "주어진 주제에 대해 **영어로 간단히 글을 작성해보세요**.")
        );

        return instructions.getOrDefault(detailType,
            "지문의 주요 내용이나 세부사항을 파악하는 데 중점을 두어 **한글로** 명확하고 구체적인 질문을 작성하세요.");
    }
}
