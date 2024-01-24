package com.codemouse.salog.ledger.income.dto;

import com.codemouse.salog.tags.ledgerTags.dto.LedgerTagDto;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;

public class IncomeDto {
    @AllArgsConstructor
    @Getter
    public static class Post {
        @Min(value = 1, message = "금액은 1 이상이어야 합니다.")
        @Max(value = 2147483646, message = "금액은 최대 2,147,483,646입니다.")
        private int money;
        @Size(max = 15, message = "incomeName이 15글자이내여야 합니다.")
        private String incomeName;
        @Size(max = 20, message = "memo는 20자이내여야 합니다.")
        private String memo;
        private LocalDate date;
        @Pattern(regexp = "^\\S{1,10}$", message = "incomeTag는 공백 없이 1~10글자 사이여야 합니다.")
        private String incomeTag;
    }

    @AllArgsConstructor
    @Getter
    public static class Patch {
        @Min(value = 1, message = "금액은 1 이상이어야 합니다.")
        @Max(value = 2147483646, message = "금액은 최대 2,147,483,646입니다.")
        private int money;
        @Size(max = 15, message = "incomeName이 15글자이내여야 합니다.")
        private String incomeName;
        @Size(max = 20, message = "memo는 20자이내여야 합니다.")
        private String memo;
        @Pattern(regexp = "^\\S{1,10}$", message = "incomeTag는 공백 없이 1~10글자 사이여야 합니다.")
        private String incomeTag;
    }

    @AllArgsConstructor
    @Getter
    @Setter
    public static class Response {
        private long incomeId;
        private int money;
        private String incomeName;
        private String memo;
        private LocalDate date;
        private LedgerTagDto.Response incomeTag;
    }

    @AllArgsConstructor
    @Getter
    @Setter
    public static class MonthlyResponse {
        private long monthlyTotal;
        private List<LedgerTagDto.MonthlyResponse> tags;
    }
}
