package com.touche.cyberhoot.service;

import com.fasterxml.jackson.databind.*;
import com.touche.cyberhoot.constants.Prompts;
import com.touche.cyberhoot.utils.OpenAPIUtils;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class QuestionService {

    private final Map<String, Map<String, Object>> questionStore = new ConcurrentHashMap<>();
    private final ObjectMapper mapper = new ObjectMapper();

    public Map<String, Object> getQuestions(Map<String, Object> input) {
        int difficulty = ((Number) input.getOrDefault("difficulty", 5)).intValue();
        String type = String.valueOf(input.getOrDefault("type", "mcq")).toLowerCase();
        String language = String.valueOf(input.getOrDefault("language", "English"));
        String topic = String.valueOf(input.getOrDefault("topic", "cybersecurity"));

        String prompt = Prompts.QUESTION_PROMPT.formatted(difficulty, language, type, topic);
        String openAi = OpenAPIUtils.sendRequest(prompt);
        String content = extract(openAi);

        String id = UUID.randomUUID().toString();
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("id", id);
        resp.put("type", type);
        resp.put("language", language);
        resp.put("topic", topic);

        if ("mcq".equals(type)) {
            int sep = content.lastIndexOf("||");
            String qBody = content.substring(0, sep).trim();
            String correct = content.substring(sep + 2).trim();

            List<String> options = qBody.lines()
                    .filter(l -> l.matches("^[A-D]\\).*"))
                    .toList();

            resp.put("text", qBody);
            resp.put("options", options);
            resp.put("correctAnswer", correct);

            /* sunucuda sakla */
            questionStore.put(id, Map.of(
                    "type", "mcq",
                    "text", qBody,
                    "correct", correct,
                    "language", language,
                    "topic", topic
            ));
        } else {
            resp.put("text", content);
            questionStore.put(id, Map.of(
                    "type", "open",
                    "text", content,
                    "language", language,
                    "topic", topic
            ));
        }
        return resp;
    }

    public Map<String, Object> submitQuestions(Map<String, Object> input) {

        String id = String.valueOf(input.get("id"));
        String answer = String.valueOf(input.get("answer"));
        boolean wantExplanation = Boolean.TRUE.equals(input.get("wantExplanation"));

        Map<String, Object> q = questionStore.get(id);
        if (q == null)
            throw new IllegalArgumentException("Invalid question id");

        String type = String.valueOf(q.get("type"));
        Map<String, Object> resp = new LinkedHashMap<>();

        if ("mcq".equals(type)) {
            String correct = String.valueOf(q.get("correct"));
            boolean isCorrect = answer.equalsIgnoreCase(correct);
            resp.put("correct", isCorrect);
            resp.put("score", isCorrect ? 10 : 0);

            if (!isCorrect && wantExplanation) {
                String p = Prompts.EXPLAIN_PROMPT.formatted(q.get("text"), correct);
                resp.put("explanation", extract(OpenAPIUtils.sendRequest(p)));
            }
            return resp;
        }

        String prompt = Prompts.OPEN_EVAL_PROMPT.formatted(q.get("text"), answer);
        String raw = OpenAPIUtils.sendRequest(prompt);

        try {
            String clean = stripCodeFence(extract(raw));
            JsonNode j = mapper.readTree(clean);

            boolean correct = j.get("correct").asBoolean();
            resp.put("correct", correct);
            resp.put("score", j.get("score").asInt());

            if (!correct && wantExplanation) {
                resp.put("explanation", j.get("explanation").asText());
            }
        } catch (Exception e) {
            resp.put("correct", false);
            resp.put("score", 0);
            resp.put("explanation", "Could not parse grading response: " + e.getMessage());
        }
        return resp;
    }

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

    /**
     * ```json … ```  veya yalnızca ``` … ``` bloklarını temizler
     */
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
