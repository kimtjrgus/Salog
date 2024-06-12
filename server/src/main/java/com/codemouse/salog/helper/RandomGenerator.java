package com.codemouse.salog.helper;

import org.springframework.stereotype.Component;

import java.util.Random;

@Component
public class RandomGenerator {

    public String generateRandomCode(int length) {
        String characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        StringBuilder sb = new StringBuilder(length);
        Random random = new Random();

        for (int i = 0; i < length; i++) {
            int index = random.nextInt(characters.length());
            char randomChar = characters.charAt(index);
            sb.append(randomChar);
        }

        System.out.println(sb); // 로그용
        return sb.toString();
    }
}
