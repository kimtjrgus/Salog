package com.codemouse.salog;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SalogApplication {

	public static void main(String[] args) {
		SpringApplication.run(SalogApplication.class, args);

		// JWT_SECRET_KEY 환경 변수 읽기
		String jwtSecretKey = System.getenv("JWT_SECRET_KEY");
		System.out.println("JWT_SECRET_KEY: " + jwtSecretKey);

		// EMAIL 환경 변수 읽기
		String email = System.getenv("EMAIL");
		System.out.println("EMAIL: " + email);

		// EMAIL_PASSWORD 환경 변수 읽기
		String emailPassword = System.getenv("EMAIL_PASSWORD");
		System.out.println("EMAIL_PASSWORD: " + emailPassword);
	}

}
