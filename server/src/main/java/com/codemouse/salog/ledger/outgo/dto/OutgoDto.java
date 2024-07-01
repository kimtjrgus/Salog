package com.codemouse.salog.ledger.outgo.dto;

import com.codemouse.salog.tags.ledgerTags.dto.LedgerTagDto;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import javax.validation.constraints.*;
import java.time.LocalDate;
import java.util.List;


public class OutgoDto {
    @AllArgsConstructor
    @Getter
    public static class Post {
        private LocalDate date;
        private int money;
        @Size(max = 15, message = "outgoName이 15글자이내여야 합니다.")
        private String outgoName;
        private String payment;
        @Size(max = 20, message = "memo는 20자이내여야 합니다.")
        private String memo;
        @Pattern(regexp = "^\\S{1,10}$", message = "outgoTag는 공백 없이 1~10글자 사이여야 합니다.")
        private String outgoTag;
        private String receiptImg;
        @NotNull(message = "wasteList가 비어있습니다.")
        private Boolean wasteList;
    }

    @NoArgsConstructor
    @AllArgsConstructor
    @Getter
    public static class PostImage {
        private String receiptImageUrl;
    }

    @AllArgsConstructor
    @Getter
    public static class Patch {
        private LocalDate date;
        private int money;
        @Size(max = 15, message = "outgoName이 15글자이내여야 합니다.")
        private String outgoName;
        private String payment;
        @Size(max = 20, message = "memo는 20자이내여야 합니다.")
        private String memo;
        @Pattern(regexp = "^\\S{1,10}$", message = "outgoTag는 공백 없이 1~10글자 사이여야 합니다.")
        private String outgoTag;
        private String receiptImg;
        private boolean wasteList;
    }

    @AllArgsConstructor
    @Getter
    public static class Response {
        private Long outgoId;
        private LocalDate date;
        private int money;
        private String outgoName;
        private String payment;
        private String memo;
        private LedgerTagDto.Response outgoTag;
        private boolean wasteList;
        private String receiptImg;
    }

    @AllArgsConstructor
    @Getter
    public static class ImageOcrResponse {
        private String date;
        private int money;
        private String outgoName;
        private String receiptImg;
    }

    @AllArgsConstructor
    @Getter
    public static class MonthlyResponse {
        private long monthlyTotal;
        private List<LedgerTagDto.MonthlyResponse> tags;
    }
}

