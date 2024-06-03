package com.codemouse.salog.members.dto;

import com.codemouse.salog.tags.ledgerTags.dto.LedgerTagDto;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;
import java.time.LocalDateTime;
import java.util.List;

public class MemberDto {
    @AllArgsConstructor
    @NoArgsConstructor
    @Getter
    @Setter
    public static class Post {
        @NotNull
        @Pattern(regexp = "^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$", message = "유효한 이메일 주소를 입력해주세요.")
        private String email;
        @NotNull
        @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[$@$!%*#?&])[A-Za-z\\d$@$!%*#?&]{8,}$", message = "유효한 비밀번호를 입력해주세요.")
        private String password;
        private boolean emailAlarm;
        private boolean homeAlarm;
    }

    @AllArgsConstructor
    @NoArgsConstructor
    @Getter
    @Setter
    public static class Patch {
        private boolean emailAlarm;
        private boolean homeAlarm;
    }

    @AllArgsConstructor
    @NoArgsConstructor
    @Getter
    @Setter
    public static class PatchPassword {
        @NotNull
        @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[$@$!%*#?&])[A-Za-z\\d$@$!%*#?&]{8,}$", message = "유효한 비밀번호를 입력해주세요.")
        private String curPassword;
        @NotNull
        @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[$@$!%*#?&])[A-Za-z\\d$@$!%*#?&]{8,}$", message = "유효한 비밀번호를 입력해주세요.")
        private String newPassword;
    }

    @NoArgsConstructor
    @Getter
    @Setter
    public static class Response {
        private long memberId;
        private String email;
        private boolean emailAlarm;
        private boolean homeAlarm;
        private LocalDateTime createdAt;
        private List<LedgerTagDto.Response> incomeTags;
        private List<LedgerTagDto.Response> outgoTags;
    }
}