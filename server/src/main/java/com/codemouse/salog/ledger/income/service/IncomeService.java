package com.codemouse.salog.ledger.income.service;

import com.codemouse.salog.auth.jwt.JwtTokenizer;
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
import com.codemouse.salog.tags.ledgerTags.dto.LedgerTagDto;
import com.codemouse.salog.tags.ledgerTags.entity.LedgerTag;
import com.codemouse.salog.tags.ledgerTags.service.LedgerTagService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import javax.validation.ConstraintViolation;
import javax.validation.Validator;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.*;
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
    private final LedgerTagService tagService;
    private final Validator validator;

    public void createIncome(String token, IncomeDto.Post incomePostDto) {
        Income income = incomeMapper.incomePostDtoToIncome(incomePostDto);

        Member member = memberService.findVerifiedMember(jwtTokenizer.getMemberId(token));
        income.setMember(member);

        // 태그
        tagHandler(incomePostDto.getIncomeTag(), token, income);
    }

    public void updateIncome(String token, long incomeId, IncomeDto.Patch incomePatchDto) {

        Income income = incomeMapper.incomePatchDtoToIncome(incomePatchDto);
        Income findIncome = findVerifiedIncome(incomeId);
        memberService.verifiedRequest(token, findIncome.getMember().getMemberId());


        Optional.of(income.getMoney())
                .ifPresent(findIncome::setMoney);
        Optional.of(income.getIncomeName())
                .ifPresent(findIncome::setIncomeName);
        Optional.of(income.getMemo())
                .ifPresent(findIncome::setMemo);
        Optional.of(income.getPayment())
                .ifPresent(findIncome::setPayment);

        // 태그
        tagHandler(incomePatchDto.getIncomeTag(), token, findIncome);
    }

    public MultiResponseDto<IncomeDto.Response> getIncomes(String token, int page, int size, String incomeTag, String date) {
        long memberId = jwtTokenizer.getMemberId(token);

        Page<Income> incomes;

        int[] arr = Arrays.stream(date.split("-")).mapToInt(Integer::parseInt).toArray();
        int year = arr[0];
        int month = arr[1];
        int day = arr[2];

        if (incomeTag != null) {
            String decodedTag = URLDecoder.decode(incomeTag, StandardCharsets.UTF_8);
            log.info("DecodedTag To UTF-8 : {}", decodedTag);

            if (day == 0) {
                incomes = incomeRepository.findByMonthAndTag(memberId, year, month, decodedTag,
                            PageRequest.of(page - 1, size, Sort.by("date").descending()));
            } else {
                incomes = incomeRepository.findByDateAndTag(memberId, year, month, day, decodedTag,
                            PageRequest.of(page - 1, size, Sort.by("date").descending()));
            }
        } else {
            if (day == 0) {
                incomes = incomeRepository.findByMonth(memberId, year, month,
                        PageRequest.of(page - 1, size, Sort.by("date").descending()));
            } else {
                incomes = incomeRepository.findByDate(memberId, year, month, day,
                        PageRequest.of(page - 1, size, Sort.by("date").descending()));
            }
        }


        List<IncomeDto.Response> incomeList = incomes.getContent().stream()
                .map(incomeMapper::incomeToIncomeResponseDto)
                .collect(Collectors.toList());

        return new MultiResponseDto<>(incomeList, incomes);
    }

    public void deleteIncome(String token, long incomeId) {

        Income income = findVerifiedIncome(incomeId);

        memberService.verifiedRequest(token, income.getMember().getMemberId());

        LedgerTag ledgerTag = income.getLedgerTag();

        // 삭제하려는 수입에만 연결된 태그인 경우, 태그 삭제
        if (ledgerTag != null && ledgerTag.getIncomes().size() == 1) {
            tagService.deleteLedgerTag(token, ledgerTag.getLedgerTagId());
        }

        // 수입과 태그의 연결을 끊음
        income.setLedgerTag(null);

        incomeRepository.delete(income);
    }

    public Income findVerifiedIncome(long incomeId) {
        return incomeRepository.findById(incomeId)
                .orElseThrow(
                        () -> new BusinessLogicException(ExceptionCode.INCOME_NOT_FOUND)
                );
    }

    // 태그 등록, 중복 체크
    private void tagHandler(String incomePostDto, String token, Income income) {
        LedgerTag ledgerTag = null;

        if (incomePostDto != null) {
            String tagName = incomePostDto;

            LedgerTag existTag = tagService.findLedgerTagByMemberIdAndTagName(token, tagName, LedgerTag.Group.INCOME);

            if (existTag != null) {
                if (existTag.getCategory() == LedgerTag.Group.INCOME) {
                    ledgerTag = existTag;
                }
            } else {
                LedgerTagDto.Post tagPost = new LedgerTagDto.Post(tagName, LedgerTag.Group.INCOME);

                Set<ConstraintViolation<LedgerTagDto.Post>> violations = validator.validate(tagPost);
                if (!violations.isEmpty()) {
                    throw new BusinessLogicException(ExceptionCode.TAG_UNVALIDATED);
                }

                ledgerTag = tagService.postLedgerTag(token, tagPost);
            }
        }

        // 만약 ledgerTag가 null이 아니라면 Income 객체에 설정
        if (ledgerTag != null) {
            income.setLedgerTag(ledgerTag);
        }

        incomeRepository.save(income);

        tagService.deleteUnusedIncomeTagsByMemberId(token);
    }
}
