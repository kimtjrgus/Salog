package com.codemouse.salog.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;

@Getter
public class LoginDto {
    @NotNull
    @Pattern(regexp = "^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$", message = "유효한 이메일 주소를 입력해주세요.")
    private String email;
    @NotNull
    @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[$@$!%*#?&])[A-Za-z\\d$@$!%*#?&]{8,}$", message = "유효한 비밀번호를 입력해주세요.")
    private String password;

    @Getter
    @Setter
    public static class response {
        private String accessToken;
        private String refreshToken;
    }
}
