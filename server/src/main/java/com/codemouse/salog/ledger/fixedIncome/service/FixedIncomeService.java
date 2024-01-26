package com.codemouse.salog.ledger.fixedIncome.service;

import com.codemouse.salog.auth.jwt.JwtTokenizer;
import com.codemouse.salog.dto.MultiResponseDto;
import com.codemouse.salog.exception.BusinessLogicException;
import com.codemouse.salog.exception.ExceptionCode;
import com.codemouse.salog.ledger.fixedIncome.dto.FixedIncomeDto;
import com.codemouse.salog.ledger.fixedIncome.entity.FixedIncome;
import com.codemouse.salog.ledger.fixedIncome.mapper.FixedIncomeMapper;
import com.codemouse.salog.ledger.fixedIncome.repository.FixedIncomeRepository;
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
public class FixedIncomeService {
    private final FixedIncomeRepository fixedIncomeRepository;
    private final FixedIncomeMapper fixedIncomeMapper;
    private final JwtTokenizer jwtTokenizer;
    private final MemberService memberService;

    public FixedIncomeDto.Response createFixedIncome(String token, FixedIncomeDto.Post fixedIncomePostDto) {
        FixedIncome fixedIncome = fixedIncomeMapper.fixedIncomePostDtoToFixedIncome(fixedIncomePostDto);

        Member member = memberService.findVerifiedMember(jwtTokenizer.getMemberId(token));
        fixedIncome.setMember(member);

        FixedIncome savedFixedIncome = fixedIncomeRepository.save(fixedIncome);

        return fixedIncomeMapper.fixedIncomeToFixedIncomeResponseDto(savedFixedIncome);
    }

    public FixedIncomeDto.Response updateFixedIncome(String token, long fixedIncomeId, FixedIncomeDto.Patch fixedIncomePatchDto) {
        FixedIncome fixedIncome = fixedIncomeMapper.fixedIncomePatchDtoToFixedIncome(fixedIncomePatchDto);
        FixedIncome findFixedIncome = findVerifiedFixedIncome(fixedIncomeId);
        memberService.verifiedRequest(token, findFixedIncome.getMember().getMemberId());

        Optional.of(fixedIncome.getIncomeName())
                .ifPresent(findFixedIncome::setIncomeName);
        Optional.of(fixedIncome.getMoney())
                .ifPresent(findFixedIncome::setMoney);
        Optional.of(fixedIncome.getDate())
                .ifPresent(findFixedIncome::setDate);

        FixedIncome savedFixedIncome = fixedIncomeRepository.save(findFixedIncome);

        return fixedIncomeMapper.fixedIncomeToFixedIncomeResponseDto(savedFixedIncome);
    }

    public MultiResponseDto<FixedIncomeDto.Response> getFixedIncomes(String token, int page, int size, String date) {
        long memberId = jwtTokenizer.getMemberId(token);

        Page<FixedIncome> fixedIncomes;

        int[] dates = Arrays.stream(date.split("-")).mapToInt(Integer::parseInt).toArray();
        int year = dates[0];
        int month = dates[1];
        int day = dates[2];

        if (day == 0) {
            fixedIncomes = fixedIncomeRepository.findByMonth(memberId, year, month,
                    PageRequest.of(page - 1, size, Sort.by("date").descending()));
        } else {
            fixedIncomes = fixedIncomeRepository.findByDate(memberId, year, month, day,
                    PageRequest.of(page - 1, size, Sort.by("date").descending()));
        }

        List<FixedIncomeDto.Response> fixedIncomeList = fixedIncomes.getContent().stream()
                .map(fixedIncomeMapper::fixedIncomeToFixedIncomeResponseDto)
                .collect(Collectors.toList());

        return new MultiResponseDto<>(fixedIncomeList, fixedIncomes);
    }

    public void deleteFixedIncome(String token, long fixedIncomeId) {
        FixedIncome fixedIncome = findVerifiedFixedIncome(fixedIncomeId);

        memberService.verifiedRequest(token, fixedIncome.getMember().getMemberId());

        fixedIncomeRepository.delete(fixedIncome);
    }

    public FixedIncome findVerifiedFixedIncome(long fixedIncomeId) {
        return fixedIncomeRepository.findById(fixedIncomeId)
                .orElseThrow(
                        () -> new BusinessLogicException(ExceptionCode.FIXED_INCOME_NOT_FOUND)
                );
    }
}
