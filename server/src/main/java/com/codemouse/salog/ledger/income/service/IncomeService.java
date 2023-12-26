package com.codemouse.salog.ledger.income.service;

import com.codemouse.salog.dto.MultiResponseDto;
import com.codemouse.salog.exception.BusinessLogicException;
import com.codemouse.salog.exception.ExceptionCode;
import com.codemouse.salog.ledger.income.dto.IncomeDto;
import com.codemouse.salog.ledger.income.entity.Income;
import com.codemouse.salog.ledger.income.mapper.IncomeMapper;
import com.codemouse.salog.ledger.income.repository.IncomeRepository;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.Optional;

@AllArgsConstructor
@Service
@Transactional
@Slf4j
public class IncomeService {
    private final IncomeRepository incomeRepository;
    private final IncomeMapper incomeMapper;

    public void createIncome(String token, IncomeDto.Post incomePostDto) {
        Income income = incomeMapper.incomePostDtoToIncome(incomePostDto);

        incomeRepository.save(income);
    }

    public void updateIncome(String token, long incomeId, IncomeDto.Patch incomePatchDto) {
        Income income = incomeMapper.incomePatchDtoToIncome(incomePatchDto);
        Income findIncome = findVerifiedIncome(incomeId);

        Optional.of(income.getMoney())
                .ifPresent(findIncome::setMoney);
        Optional.of(income.getIncomeName())
                .ifPresent(findIncome::setIncomeName);
        Optional.of(income.getMemo())
                .ifPresent(findIncome::setMemo);

        incomeRepository.save(findIncome);
    }

    public MultiResponseDto<IncomeDto.Response> getIncomes(String token, int page, int size, String incomeTag, LocalDateTime date) {
        /* todo 2023-12-26
            수입은 조회 시 전체가 싹다 조회되는게 아니라 날짜를 특정해서 조회해야할거 같은데?
            날짜는 일일 까지 뽑아 쓰되, 무조건 들어올 수 있게 조치를 취해야할듯
         */
        return null;
    }

    public void deleteIncome(String token, long incomeId) {
        incomeRepository.delete(findVerifiedIncome(incomeId));
    }

    public Income findVerifiedIncome(long incomeId) {
        return incomeRepository.findById(incomeId)
                .orElseThrow(
                        () -> new BusinessLogicException(ExceptionCode.INCOME_NOT_FOUND)
                );
    }
}
