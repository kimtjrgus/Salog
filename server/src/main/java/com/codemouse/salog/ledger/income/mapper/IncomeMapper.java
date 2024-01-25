package com.codemouse.salog.ledger.income.mapper;

import com.codemouse.salog.ledger.income.dto.IncomeDto;
import com.codemouse.salog.ledger.income.entity.Income;
import com.codemouse.salog.tags.ledgerTags.mapper.LedgerTagMapper;
import org.hibernate.annotations.Target;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", uses = LedgerTagMapper.class, unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface IncomeMapper {
    Income incomePostDtoToIncome(IncomeDto.Post requestBody);
    Income incomePatchDtoToIncome(IncomeDto.Patch requestBody);
    @Mapping(source = "ledgerTag", target = "incomeTag", qualifiedByName = "ledgerTagToLedgerTagResponseDto")
    IncomeDto.Response incomeToIncomeResponseDto(Income income);
}
