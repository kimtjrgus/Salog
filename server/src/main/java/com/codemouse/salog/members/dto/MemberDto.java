package com.codemouse.salog.members.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class MemberDto {
    @AllArgsConstructor
    @Getter
    public static class Post {
        private String email;
        private String password;
        private boolean emailAlarm;
        private boolean homeAlarm;
    }

    @AllArgsConstructor
    @Getter
    public static class Patch {
        private boolean emailAlarm;
        private boolean homeAlarm;
    }

    @AllArgsConstructor
    @Getter
    public static class PatchPassword {
        private String curPassword;
        private String newPassword;
    }


    @AllArgsConstructor
    @Getter
    public static class Response {
        private int memberId;
        private boolean emailAlarm;
        private boolean homeAlarm;
        private LocalDateTime createdAt;
    }
}