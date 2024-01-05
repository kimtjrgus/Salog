package com.codemouse.salog.ledger.income.mapper;

import com.codemouse.salog.ledger.income.dto.IncomeDto;
import com.codemouse.salog.ledger.income.entity.Income;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface IncomeMapper {
    Income incomePostDtoToIncome(IncomeDto.Post requestBody);
    Income incomePatchDtoToIncome(IncomeDto.Patch requestBody);
    IncomeDto.Response incomeToIncomeResponseDto(Income income);
}
