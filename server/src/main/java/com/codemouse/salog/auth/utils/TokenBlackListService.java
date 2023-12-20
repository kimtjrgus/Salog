package com.codemouse.salog.auth.utils;

import com.codemouse.salog.exception.BusinessLogicException;
import com.codemouse.salog.exception.ExceptionCode;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;

// 로그아웃 - 토큰 블랙리스트 처리
// todo-2023-12-19 현재 모든 컨트롤러와 결합도가 높아, 인터셉터 혹은 필터를 활용해 선 검증을 거치도록 리펙터링 해야함
@Component
public class TokenBlackListService {
    private Set<String> blackList = new HashSet<>();

    public void addToBlackList(String token) {
        blackList.add(token);
    }

    public void isBlackListed(String token) {
        if (blackList.contains(token))
            throw new BusinessLogicException(ExceptionCode.LOGOUT);
    }
}
