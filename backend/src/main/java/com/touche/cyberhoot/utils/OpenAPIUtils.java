/* -------------------------------------------------
 * 2.  ‣  utils/OpenAPIUtils.java
 * ------------------------------------------------- */
package com.touche.cyberhoot.utils;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public final class OpenAPIUtils {

    private static final String API_URL = "https://api.openai.com/v1/chat/completions";
    private static final String API_KEY = "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";   // <--  secure!

    public static String sendRequest(String prompt) {
        if (API_KEY == null || API_KEY.isBlank()) {
            throw new IllegalStateException("Set OPENAI_API_KEY env-var first.");
        }
        try {
            String body = """
                    {
                      "model":"gpt-4o",
                      "messages":[{"role":"user","content":%s}]
                    }""".formatted(escape(prompt));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(API_URL))
                    .header("Authorization", "Bearer " + API_KEY)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();

            HttpClient client = HttpClient.newHttpClient();
            HttpResponse<String> resp = client.send(request, HttpResponse.BodyHandlers.ofString());
            return resp.body();                             // raw JSON from OpenAI
        } catch (Exception e) {
            throw new RuntimeException("OpenAI request failed", e);
        }
    }

    private static String escape(String s) {
        return "\"" + s.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n") + "\"";
    }

    private OpenAPIUtils() {}
}
