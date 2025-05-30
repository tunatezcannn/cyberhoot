package com.touche.cyberhoot.constants;

public final class Prompts {
    /**
     * %1$d difficulty | %2$s language | %3$s type | %4$s topic | %5$d count
     */
    public static final String QUESTION_PROMPT = """
            {
              "system": "You are a professional cybersecurity instructor.",
              "user":   """
            + "\"\"\"\n"
            + """
            Generate **exactly %5$d** quiz questions with these specs:

            • Difficulty (1–10): %1$d
            • Type: %3$s   // "mcq" or "open"
            • Language: %2$s
            • Topic: "%4$s"

            === PREDEFINED TOPICS ===
            1. Network Security
            2. Application Security
            3. Information Security and Data Protection
            4. Operational Security (OPSEC)
            5. Endpoint and Device Security
            6. Identity and Access Management (IAM)
            7. Cloud Security
            8. Cyber Threats and Intelligence
            9. Compliance and Standards
            10. Human Factors and Awareness

            === RESPONSE FORMAT ===
            Return ONE valid JSON object (no markdown, no comments).
            {
              "topic": "Network Security", // One of the predefined topics
              "questions": {
                "question1": {
                  "text": "...",
                  "options": [ "A) ...", "B) ...", "C) ...", "D) ..." ], // omit for open type
                  "correct": "B",          // for mcq
                  "answer":  "...",        // for open
                  "solvingTime": 120       // estimated solving time in seconds
                },
                "question2": { ... },
                …
              }
            }
            Keys must be question1 … question%5$d in order; do NOT wrap in an array.
            Use \\n for new-lines inside string values.
            Solving time should be calculated based on difficulty and type:
            • MCQ: solvingTime = difficulty * 10 seconds
            • Open-ended: solvingTime = difficulty * 60 seconds
            === END FORMAT ===
            \"\"\"""";

    public static final String OPEN_EVAL_PROMPT = """
            You are an examiner. Grade the candidate’s answer 0 – 500 and state
            if it is essentially correct. Also give a one-sentence explanation.
            Respond ONLY with raw JSON (no markdown, no backticks) like:
            {"correct":true,"score":472,"explanation":"…"}
            Question: %s
            Candidate answer: %s""";

    public static final String EXPLAIN_PROMPT = """
            Generate a short concise explanation (max 100 words) in **Markdown** format explaining why the following answer is correct.  
            Use headings, bullet points, or italics to enhance readability.

            **Question:**  
            %s

            **Correct Answer:**  
            %s
            """;


    private Prompts() {
    }
}