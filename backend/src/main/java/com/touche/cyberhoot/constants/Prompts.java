package com.touche.cyberhoot.constants;

public final class Prompts {

    /**
     * %1$d difficulty | %2$s language | %3$s type | %4$s topic
     */
    public static final String QUESTION_PROMPT = """
            You are a professional instructor.
            Produce ONE %3$s-style question at difficulty %1$d (scale 1-10)
            **in %2$s** about **%4$s**.
            • If “mcq”, give EXACTLY four options labelled A), B), C), D),
              then append “||<letter>” with the single correct option.
            • If “open”, just give the question text.
            Respond ONLY with the question (and options if mcq).""";

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
