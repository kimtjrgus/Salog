package com.codemouse.salog.ledger.outgo.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import javax.validation.constraints.*;
import java.time.LocalDate;


public class OutgoDto {
    @AllArgsConstructor
    @Getter
    public static class Post {
        @Pattern(regexp = "^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|1[0-2]|2[0-8]|(29|30)(?!-02)|(31)(?<!-02|-04|-06|-09|-11))$",
                message = "date가 유효하지 않습니다. 'yyyy-MM-dd' 형식이 필요합니다")
        @NotBlank(message = "date가 비어있습니다.")
        private String date;
        @Size(max = 15, message = "outgoName이 15글자이내여야 합니다.")
        private String outgoName;
        @NotNull(message = "money가 비어있습니다.")
        private Long money;
        @Size(max = 20, message = "memo는 20자이내여야 합니다.")
        private String memo;
        @Pattern(regexp = "^\\S{1,10}$", message = "outgoTag는 공백 없이 1~10글자 사이여야 합니다.")
        private String outgoTag;
        private String receiptImg;
        @NotNull(message = "wasteList가 비어있습니다.")
        private Boolean wasteList;
    }

    @AllArgsConstructor
    @Getter
    public static class Patch {
        @Pattern(regexp = "^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|1[0-2]|2[0-8]|(29|30)(?!-02)|(31)(?<!-02|-04|-06|-09|-11))$",
                message = "date가 유효하지 않습니다. 'yyyy-MM-dd' 형식이 필요합니다")
        private String date;
        @Size(max = 15, message = "outgoName이 15글자이내여야 합니다.")
        private String outgoName;
        private Long money;
        @Size(max = 20, message = "memo는 20자이내여야 합니다.")
        private String memo;
        @Pattern(regexp = "^\\S{1,10}$", message = "outgoTag는 공백 없이 1~10글자 사이여야 합니다.")
        private String outgoTag;
        private String receiptImg;
        private Boolean wasteList;
    }

    @AllArgsConstructor
    @Getter
    public static class Response {
        private long outgoId;
        private Long diaryId;
        private LocalDate date;
        private long money;
        private String outgoName;
        private String memo;
        private String outgoTag;
        private boolean wasteList;
        private String receiptImg;
    }
}
