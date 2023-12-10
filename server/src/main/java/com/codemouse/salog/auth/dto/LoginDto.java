package com.codemouse.salog.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
public class LoginDto {
    private String email;
    private String password;

    @Getter
    @Setter
    public static class response {
        private String accessToken;
        private String refreshToken;
    }
}
