package com.codemouse.salog.exception;

import lombok.Getter;

// 커스텀 에러코드, 예상 되는 에러 코드 작성할 것
@Getter
public enum ExceptionCode {
    // 회원
    MEMBER_NOT_FOUND(404, "MEMBER_NOT_FOUND 존재하지 않는 회원"),
    MEMBER_UNAUTHORIZED(401,"MEMBER_UNAUTHORIZED 인증되지 않음"),
    MEMBER_EXISTS(409, "MEMBER_EXISTS 이미 존재하는 회원"),
    NOT_IMPLEMENTATION(501, "Not Implementation 존재하지 않는 기능"),
    PASSWORD_MISMATCHED(400,"PASSWORD_MISMATCHED 비밀번호가 일치하지 않음"),
    ID_MISMATCHED(400,"ID_MISMATCHED 아이디가 일치하지 않음"),
    MEMBER_ALREADY_DELETED(409, "MEMBER_ALREADY_DELETED 이미 탈퇴한 회원"),
    EMAIL_EXIST(409, "EMAIL_EXIST 이미 존재하는 이메일"),
    PASSWORD_IDENTICAL(409, "PASSWORD_IDENTICAL 이전 비밀번호와 동일함"),
    LOGOUT(400, "LOGOUT 재로그인 필요"),
    TOKEN_EXPIRED(400, "TOKEN_EXPIRED 토큰 만료"),
    TOKEN_INVALID(400, "TOKEN_INVALID 유효하지 않은 토큰"),

    // 일기
    MEMBER_MISMATCHED(400, "MEMBER_MISMATCHED MemberId가 일치하지 않음"),
    DIARY_NOT_FOUND(404, "DIARY_NOT_FOUND 존재하지 않는 일기"),
    TAG_NOT_FOUND(404, "TAG_NOT_FOUND 존재하지 않는 태그"),
    TAG_UNVALIDATED(400, "TAG_UNVALIDATED 유효하지않은 태그, 10글자이내로 입력바람"),

    // 수입
    INCOME_NOT_FOUND(404, "INCOME_NOT_FOUND 존재하지 않는 수입"),

    // 고정 수입
    FIXED_INCOME_NOT_FOUND(404, "FIXED_INCOME_NOT_FOUND 존재하지 않는 고정 수입"),

    // 지출
    OUTGO_NOT_FOUND(404, "OUTGO_NOT_FOUND 존재하지 않는 지출"),

    // 고정 지출
    FIXED_OUTGO_NOT_FOUND(404, "FIXED_OUTGO_NOT_FOUND 존재하지 않는 고정 지출");

    private int status;

    private String message;

    ExceptionCode(int code, String message) {
        this.status = code;
        this.message = message;
    }
}
