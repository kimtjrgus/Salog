package com.codemouse.salog.exception;

import lombok.Getter;

// 커스텀 에러코드, 예상 되는 에러 코드 작성할 것
@Getter
public enum ExceptionCode {
    MEMBER_NOT_FOUND(404, "MEMBER_NOT_FOUND\n존재하지 않는 회원"),
    MEMBER_UNAUTHORIZED(401,"MEMBER_UNAUTHORIZED\n인증되지 않음"),
    MEMBER_EXISTS(409, "MEMBER_EXISTS\n이미 존재하는 회원"),
    NOT_IMPLEMENTATION(501, "Not Implementation\n존재하지 않는 기능"),
    PASSWORD_MISMATCHED(400,"PASSWORD_MISMATCHED\n비밀번호가 일치하지 않음"),
    ID_MISMATCHED(400,"ID_MISMATCHED\n아이디가 일치하지 않음");

    private int status;

    private String message;

    ExceptionCode(int code, String message) {
        this.status = code;
        this.message = message;
    }
}
