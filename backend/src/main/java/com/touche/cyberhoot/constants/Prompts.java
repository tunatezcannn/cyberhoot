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
    
          === RESPONSE FORMAT ===
          Return ONE valid JSON object (no markdown, no comments).
          {
            "question1": {
              "text": "...",
              "options": [ "A) ...", "B) ...", "C) ...", "D) ..." ], // omit for open type
              "correct": "B"           // for mcq
              "answer":  "..."         // for open
            },
            "question2": { ... },
            …
          }
          Keys must be question1 … question%5$d in order; do NOT wrap in an array.
          Use \\n for new-lines inside string values.
          === END FORMAT ===
          \"\"\"""";


    public static final String OPEN_EVAL_PROMPT = """
            You are an examiner. Grade the candidate’s answer 0 – 10 and state
            if it is essentially correct. Also give a one-sentence explanation.
            Respond ONLY with raw JSON (no markdown, no backticks) like:
            {"correct":true,"score":9,"explanation":"…"}
            Question: %s
            Candidate answer: %s""";

    public static final String EXPLAIN_PROMPT = """
            Explain concisely why the following is the correct answer.
            Question: %s
            Correct answer: %s""";

    private Prompts() {
    }
}