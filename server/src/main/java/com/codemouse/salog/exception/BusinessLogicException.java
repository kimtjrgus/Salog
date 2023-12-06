package com.codemouse.salog.exception;

import lombok.Getter;

// 커스텀 에러 코드를 가져와서 에러 리스폰스 생성 후 클라이언트에게 반환
public class BusinessLogicException extends RuntimeException {
    @Getter
    private ExceptionCode exceptionCode;

    public BusinessLogicException(ExceptionCode exceptionCode) {
        super(exceptionCode.getMessage());
        this.exceptionCode = exceptionCode;
    }
}
