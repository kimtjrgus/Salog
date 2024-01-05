package com.codemouse.salog.ledger.income.service;

import com.codemouse.salog.auth.jwt.JwtTokenizer;
import com.codemouse.salog.diary.entity.Diary;
import com.codemouse.salog.diary.service.DiaryService;
import com.codemouse.salog.dto.MultiResponseDto;
import com.codemouse.salog.exception.BusinessLogicException;
import com.codemouse.salog.exception.ExceptionCode;
import com.codemouse.salog.ledger.income.dto.IncomeDto;
import com.codemouse.salog.ledger.income.entity.Income;
import com.codemouse.salog.ledger.income.mapper.IncomeMapper;
import com.codemouse.salog.ledger.income.repository.IncomeRepository;
import com.codemouse.salog.members.entity.Member;
import com.codemouse.salog.members.service.MemberService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@AllArgsConstructor
@Service
@Transactional
@Slf4j
public class IncomeService {
    private final IncomeRepository incomeRepository;
    private final IncomeMapper incomeMapper;
    private final MemberService memberService;
    private final JwtTokenizer jwtTokenizer;
    private final DiaryService diaryService;

    public void createIncome(String token, IncomeDto.Post incomePostDto) {
        Income income = incomeMapper.incomePostDtoToIncome(incomePostDto);

        Member member = memberService.findVerifiedMember(jwtTokenizer.getMemberId(token));
        income.setMember(member);

        incomeRepository.save(income);
    }

    public void updateIncome(String token, long incomeId, IncomeDto.Patch incomePatchDto) {
        memberService.verifiedRequest(token, incomeId);

        Income income = incomeMapper.incomePatchDtoToIncome(incomePatchDto);
        Income findIncome = findVerifiedIncome(incomeId);

        Diary diary = diaryService.findVerifiedDiary(incomePatchDto.getDiaryId());

        Optional.of(income.getMoney())
                .ifPresent(findIncome::setMoney);
        Optional.of(income.getIncomeName())
                .ifPresent(findIncome::setIncomeName);
        Optional.of(income.getMemo())
                .ifPresent(findIncome::setMemo);
        // todo 2024-01-03 다이어리 핸들링
        Optional.of(diary)
                .ifPresent(findIncome::setDiary);

        incomeRepository.save(findIncome);
    }

    public MultiResponseDto<IncomeDto.Response> getIncomes(String token, int page, int size, String incomeTag, String date) {
        long memberId = jwtTokenizer.getMemberId(token);

        int[] arr = Arrays.stream(date.split("-")).mapToInt(Integer::parseInt).toArray();
        int year = arr[0];
        int month = arr[1];
        int day = arr[2];

        Page<Income> incomes;

//        if (incomeTag != null) {
//            if (day == 0) {
//                incomes = incomeRepository.findByMonthAndTag(memberId, year, month, incomeTag,
//                        PageRequest.of(page - 1, size, Sort.by("date").descending()));
//            } else {
//                incomes = incomeRepository.findByDateAndTag(memberId, year, month, day, incomeTag,
//                        PageRequest.of(page - 1, size, Sort.by("date").descending()));
//            }
//        } else {
            if (day == 0) {
                incomes = incomeRepository.findByMonth(memberId, year, month,
                        PageRequest.of(page - 1, size, Sort.by("date").descending()));
            } else {
                incomes = incomeRepository.findByDate(memberId, year, month, day,
                        PageRequest.of(page - 1, size, Sort.by("date").descending()));
            }
//        }

        List<IncomeDto.Response> incomeList = incomes.getContent().stream()
                .map(incomeMapper::incomeToIncomeResponseDto).collect(Collectors.toList());

        return new MultiResponseDto<>(incomeList, incomes);
    }

    public void deleteIncome(String token, long incomeId) {
        memberService.verifiedRequest(token, incomeId);

        incomeRepository.delete(findVerifiedIncome(incomeId));
    }

    public Income findVerifiedIncome(long incomeId) {
        return incomeRepository.findById(incomeId)
                .orElseThrow(
                        () -> new BusinessLogicException(ExceptionCode.INCOME_NOT_FOUND)
                );
    }
}
