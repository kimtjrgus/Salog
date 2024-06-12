package com.codemouse.salog;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class SalogApplicationTests {

	@Test
	void contextLoads() {
	}

	// 로컬 -> 깃헙 푸쉬 시 모든 테스트 실행시키도록 로컬 .git/hooks 위치에 스크립트 파일 생성
	/*
	해당 스크립트 내용
	#!/bin/sh

	# Git 리포지토리의 루트 디렉토리로 이동
	cd "$(git rev-parse --show-toplevel)"

	# gradlew 파일이 있는 디렉토리로 이동
	cd server

	# Gradle 테스트 실행
	./gradlew test
	if [ $? -ne 0 ]; then
  	echo "Tests failed, push aborted."
  	exit 1
	fi
	 */
}
