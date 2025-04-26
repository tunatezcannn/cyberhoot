package com.touche.cyberhoot.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.*;
import com.touche.cyberhoot.constants.Prompts;
import com.touche.cyberhoot.dto.GetExplanationRequest;
import com.touche.cyberhoot.dto.GetQuestionRequest;
import com.touche.cyberhoot.dto.GetSessionQuestionRequest;
import com.touche.cyberhoot.dto.SubmitAnswerRequest;
import com.touche.cyberhoot.model.GameSession;
import com.touche.cyberhoot.model.Question;
import com.touche.cyberhoot.model.QuestionAnswer;
import com.touche.cyberhoot.repository.QuestionAnswerRepository;
import com.touche.cyberhoot.repository.QuestionRepository;
import com.touche.cyberhoot.repository.SessionRepository;
import com.touche.cyberhoot.utils.OpenAPIUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class QuestionService {

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private QuestionAnswerRepository answerRepository;

    @Autowired
    private SessionRepository sessionRepository;

    ObjectMapper mapper = new ObjectMapper();

    public List<Map<String, Object>> getQuestions(GetQuestionRequest input) {

        int difficulty = input.getDifficulty();
        String type = input.getType().trim().toLowerCase(Locale.ROOT);
        String language = input.getLanguage();
        String topic = input.getTopic();
        int count = input.getCount();

        String prompt = Prompts.QUESTION_PROMPT.formatted(
                difficulty, language, type, topic, count);

        String rawJson = extract(OpenAPIUtils.sendRequest(prompt)).trim();

        ObjectMapper mapper = new ObjectMapper();
        Map<String, Map<String, Object>> root = null;
        try {
            root = mapper.readValue(rawJson, new TypeReference<>() {});
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }

        if (root.size() != count)
            throw new IllegalStateException("Expected " + count +
                    " questions but got " + root.size() + ". Raw GPT output:\n" + rawJson);

        List<Map<String, Object>> out = new ArrayList<>(count);

        for (int i = 1; i <= count; i++) {
            Map<String, Object> qMap = root.get("question" + i);
            if (qMap == null)
                throw new IllegalStateException("Missing key question" + i);

            String text = Objects.toString(qMap.get("text"), "").trim();

            Question.QuestionBuilder qb = Question.builder()
                    .question_type(type)
                    .question_lang(language)
                    .topic(topic)
                    .difficulty(difficulty)
                    .question_text(text);

            Map<String, Object> resp = new LinkedHashMap<>();
            resp.put("type", type);
            resp.put("language", language);
            resp.put("topic", topic);
            resp.put("difficulty", difficulty);
            resp.put("text", text);

            if ("mcq".equals(type)) {
                @SuppressWarnings("unchecked")
                List<String> options = (List<String>) qMap.get("options");
                String correct = Objects.toString(qMap.get("correct"), "").trim();
                qb.correct(correct);
                resp.put("options", options);
                resp.put("answer", correct);
            } else {
                String answer = Objects.toString(qMap.get("answer"), "").trim();
                qb.correct(answer);
                resp.put("answer", answer);
            }

            Question saved = questionRepository.save(qb.build());
            resp.put("id", saved.getId());
            out.add(resp);
        }
        return out;
    }

    public Map<String, Object> submitAnswer(SubmitAnswerRequest input) {
        Long questionId = input.getQuestionId();
        String userAnswer = input.getUserAnswer();

        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid question ID"));

        boolean correct;
        int score;

        if ("mcq".equals(question.getQuestionType())) {
            correct = userAnswer.equalsIgnoreCase(question.getCorrect());
            score = correct ? 100 : 0;
        } else {
            String prompt = Prompts.OPEN_EVAL_PROMPT.formatted(question.getQuestionText(), userAnswer);
            String rawResponse = OpenAPIUtils.sendRequest(prompt);

            JsonNode responseJson;
            try {
                responseJson = mapper.readTree(stripCodeFence(extract(rawResponse)));
            } catch (JsonProcessingException e) {
                throw new RuntimeException("Failed to parse ChatGPT response", e);
            }

            correct = responseJson.get("correct").asBoolean();
            score = Math.max(1, Math.min(100, responseJson.get("score").asInt()));
        }

        QuestionAnswer savedAnswer = answerRepository.save(QuestionAnswer.builder()
                .question(question)
                .userAnswer(userAnswer)
                .correct(correct)
                .score(score)
                .build());

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("id", savedAnswer.getId());
        response.put("correct", correct);
        response.put("score", score);

        return response;
    }

    public Map<String, Object> getExplanation(GetExplanationRequest input) {
        Question q = questionRepository.findById(input.getQuestionId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid question id"));

        if (!"mcq".equals(q.getQuestionType()))
            throw new IllegalArgumentException("Explanations are only available for MCQ questions");

        String p = Prompts.EXPLAIN_PROMPT.formatted(q.getQuestionText(), q.getCorrect());
        String expl = extract(OpenAPIUtils.sendRequest(p));

        return Map.of("id", q.getId(),
                "explanation", expl);
    }

    public List<Map<String, Object>> getSessionQuestions(GetSessionQuestionRequest input) {
        GameSession session = sessionRepository.findByCode(input.getSessionCode())
                .orElseThrow(() -> new IllegalArgumentException("Invalid session code"));

        List<Question> questions = session.getQuestions();

        // Prepare the response
        List<Map<String, Object>> response = new ArrayList<>();
        for (Question q : questions) {
            Map<String, Object> questionData = new LinkedHashMap<>();
            questionData.put("id", q.getId());
            questionData.put("text", q.getQuestionText());
            questionData.put("type", q.getQuestionType());
            questionData.put("language", q.getQuestionLang());
            questionData.put("topic", q.getTopic());
            questionData.put("difficulty", q.getDifficulty());

            if ("mcq".equals(q.getQuestionType())) {
                questionData.put("options", q.getQuestionOptions());
            }
            response.add(questionData);
        }

        return response;
    }


    /* --------------------------------------------------------------------- */
    private String extract(String openAiJson) {
        try {
            return mapper.readTree(openAiJson)
                    .at("/choices/0/message/content")
                    .asText("")
                    .trim();
        } catch (Exception e) {
            throw new RuntimeException("Bad OpenAI JSON", e);
        }
    }

    private String stripCodeFence(String s) {
        String t = s.trim();
        if (t.startsWith("```")) {
            t = t.replaceFirst("```[a-zA-Z]*\\s*", "")
                    .replaceFirst("\\s*```\\s*$", "");
        }
        int first = t.indexOf('{');
        int last = t.lastIndexOf('}');
        return (first >= 0 && last > first) ? t.substring(first, last + 1).trim() : t;
    }
}
