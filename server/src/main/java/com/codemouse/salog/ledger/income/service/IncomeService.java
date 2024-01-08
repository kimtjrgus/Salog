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
import com.codemouse.salog.tags.ledgerTags.dto.LedgerTagDto;
import com.codemouse.salog.tags.ledgerTags.entity.LedgerTag;
import com.codemouse.salog.tags.ledgerTags.entity.LedgerTagLink;
import com.codemouse.salog.tags.ledgerTags.mapper.LedgerTagMapper;
import com.codemouse.salog.tags.ledgerTags.repository.LedgerTagLinkRepository;
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
    private final LedgerTagLinkRepository ledgerTagLinkRepository;
    private final LedgerTagMapper tagMapper;

    public void createIncome(String token, IncomeDto.Post incomePostDto) {
        Income income = incomeMapper.incomePostDtoToIncome(incomePostDto);

        Member member = memberService.findVerifiedMember(jwtTokenizer.getMemberId(token));
        income.setMember(member);

        // 태그
        List<LedgerTag> createdLedgerTag = new ArrayList<>();
        for (String tagName : incomePostDto.getIncomeTag()) {
            if (tagName == null || tagName.isEmpty()) {
                continue;
            }

            LedgerTag existLedgerTag = tagService.findLedgerTagByMemberIdAndTagName(token, tagName);

            LedgerTag ledgerTag;

            if (existLedgerTag != null) {
                ledgerTag = existLedgerTag;
            } else {
                LedgerTagDto.Post tagPost = new LedgerTagDto.Post(tagName);

                Set<ConstraintViolation<LedgerTagDto.Post>> violations = validator.validate(tagPost);
                if (!violations.isEmpty()) {
                    throw new BusinessLogicException(ExceptionCode.TAG_UNVALIDATED);
                }

                ledgerTag = tagService.postLedgerTag(token, tagPost);
            }

            createdLedgerTag.add(ledgerTag);
        }

        for (LedgerTag ledgerTag : createdLedgerTag) {
            LedgerTagLink ledgerTagLink = new LedgerTagLink();
            ledgerTagLink.setIncome(income);
            ledgerTagLink.setLedgerTag(ledgerTag);
            income.getLedgerTagLinks().add(ledgerTagLink);
        }

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

        // 태그
        if (incomePatchDto.getIncomeTag() != null) {
            findIncome.getLedgerTagLinks().clear();

            for (String tagName : incomePatchDto.getIncomeTag()) {
                LedgerTag existTag = tagService.findLedgerTagByMemberIdAndTagName(token, tagName);

                LedgerTag ledgerTag;

                if (existTag != null) {
                    ledgerTag = existTag;
                } else {
                    LedgerTagDto.Post tagPost = new LedgerTagDto.Post(tagName);

                    Set<ConstraintViolation<LedgerTagDto.Post>> violations = validator.validate(tagPost);
                    if (!violations.isEmpty()) {
                        throw new BusinessLogicException(ExceptionCode.TAG_UNVALIDATED);
                    }

                    ledgerTag = tagService.postLedgerTag(token, tagPost);
                }

                LedgerTagLink ledgerTagLink = new LedgerTagLink();
                ledgerTagLink.setIncome(findIncome);
                ledgerTagLink.setLedgerTag(ledgerTag);
                findIncome.getLedgerTagLinks().add(ledgerTagLink);
            }

            tagService.deleteUnusedTagsByMemberId(token);
        }

        incomeRepository.save(findIncome);
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
                .map(income -> {
                    IncomeDto.Response response = incomeMapper.incomeToIncomeResponseDto(income);

                    List<LedgerTagDto.Response> tagList = income.getLedgerTagLinks().stream()
                            .map(LedgerTagLink::getLedgerTag)
                            .map(tagMapper::ledgerTagToLedgerTagResponseDto)
                            .collect(Collectors.toList());
                    response.setIncomeTag(tagList);

                    return response;
                }).collect(Collectors.toList());

        return new MultiResponseDto<>(incomeList, incomes);
    }

    public void deleteIncome(String token, long incomeId) {
        memberService.verifiedRequest(token, incomeId);

        Income income = findVerifiedIncome(incomeId);

        List<LedgerTag> ledgerTags = income.getLedgerTagLinks().stream()
                        .map(LedgerTagLink::getLedgerTag)
                        .collect(Collectors.toList());

        for (LedgerTag ledgerTag : ledgerTags) {
            List<LedgerTagLink> links = ledgerTag.getLedgerTagLinks();
            if (links.size() == 1 && links.get(0).getIncome().getIncomeId() == incomeId) {
                tagService.deleteLedgerTag(token, ledgerTag.getLedgerTagId());
            }
        }

        incomeRepository.delete(income);
    }

    public Income findVerifiedIncome(long incomeId) {
        return incomeRepository.findById(incomeId)
                .orElseThrow(
                        () -> new BusinessLogicException(ExceptionCode.INCOME_NOT_FOUND)
                );
    }
}
