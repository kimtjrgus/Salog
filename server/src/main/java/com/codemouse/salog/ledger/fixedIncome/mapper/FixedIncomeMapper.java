package com.codemouse.salog.ledger.fixedIncome.mapper;

import com.codemouse.salog.ledger.fixedIncome.dto.FixedIncomeDto;
import com.codemouse.salog.ledger.fixedIncome.entity.FixedIncome;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface FixedIncomeMapper {
    FixedIncome fixedIncomePostDtoToFixedIncome(FixedIncomeDto.Post requestBody);
    FixedIncome fixedIncomePatchDtoToFixedIncome(FixedIncomeDto.Patch requestBody);
    FixedIncomeDto.Response fixedIncomeToFixedIncomeResponseDto(FixedIncome fixedIncome);
}
