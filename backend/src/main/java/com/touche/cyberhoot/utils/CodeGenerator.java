package com.touche.cyberhoot.utils;

import java.util.Random;

public class CodeGenerator {
    public static String generateRandomCode() {
        Random random = new Random();
        int randomCode = 100000 + random.nextInt(900000);
        return String.valueOf(randomCode);
    }
}
