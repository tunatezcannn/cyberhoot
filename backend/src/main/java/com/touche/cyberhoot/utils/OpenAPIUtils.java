package com.touche.cyberhoot.utils;

import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Component
public class OpenAPIUtils {

    private static final String API_URL = "https://api.openai.com/v1/chat/completions";
    private static final String API_KEY = "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";

    public static String sendRequest(String prompt) {
        if (API_KEY == null || API_KEY.isBlank()) {
            throw new IllegalStateException(
                    "Missing OpenAI API key! Set OPENAI_API_KEY in your environment.");
        }

        try {
            HttpClient client = HttpClient.newHttpClient();
            String safePrompt = prompt.replace("\"", "\\\"");

            String requestBody = String.format(
                    "{"
                            + "  \"model\": \"gpt-4o\","
                            + "  \"messages\": ["
                            + "    {\"role\": \"user\", \"content\": \"%s\"}"
                            + "  ]"
                            + "}",
                    safePrompt
            );

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(API_URL))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + API_KEY)
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            return response.body();

        } catch (Exception e) {
            e.printStackTrace();
            return "Error: " + e.getMessage();
        }
    }
}
