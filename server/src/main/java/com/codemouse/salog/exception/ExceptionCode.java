package com.codemouse.salog.exception;

import lombok.Getter;

// 커스텀 에러코드, 예상 되는 에러 코드 작성할 것
@Getter
public enum ExceptionCode {
    MEMBER_NOT_FOUND(404, "Member not found"),
    MEMBER_UNAUTHORIZED(401,"Member Unauthorized"),
    MEMBER_EXISTS(409, "Member exists"),
    NOT_IMPLEMENTATION(501, "Not Implementation"),
    INVALID_MEMBER_STATUS(400, "Invalid member status"),
    PASSWORD_MISMATCHED(400,"Password Does Not Match"),
    ID_MISMATCHED(400,"Id Does Not Match");

    private int status;

    private String message;

    ExceptionCode(int code, String message) {
        this.status = code;
        this.message = message;
    }
}
