package com.codemouse.salog.ledger.budget.mapper;

import com.codemouse.salog.ledger.budget.dto.BudgetDto;
import com.codemouse.salog.ledger.budget.entity.MonthlyBudget;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface BudgetMapper {
    MonthlyBudget budgetPostDtoToBudget(BudgetDto.Post requestBody);
    MonthlyBudget budgetPatchDtoToBudget(BudgetDto.Patch requestBody);
    BudgetDto.Response budgetToBudgetResponseDto(MonthlyBudget budget);
}
