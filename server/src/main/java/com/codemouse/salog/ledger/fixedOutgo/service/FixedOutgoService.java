package com.codemouse.salog.ledger.fixedOutgo.service;

import com.codemouse.salog.auth.jwt.JwtTokenizer;
import com.codemouse.salog.auth.utils.TokenBlackListService;
import com.codemouse.salog.dto.MultiResponseDto;
import com.codemouse.salog.exception.BusinessLogicException;
import com.codemouse.salog.exception.ExceptionCode;
import com.codemouse.salog.ledger.fixedOutgo.dto.FixedOutgoDto;
import com.codemouse.salog.ledger.fixedOutgo.entity.FixedOutgo;
import com.codemouse.salog.ledger.fixedOutgo.mapper.FixedOutgoMapper;
import com.codemouse.salog.ledger.fixedOutgo.repository.FixedOutgoRepository;
import com.codemouse.salog.members.entity.Member;
import com.codemouse.salog.members.service.MemberService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@AllArgsConstructor
@Service
@Transactional
@Slf4j
public class FixedOutgoService {
    private final FixedOutgoRepository fixedOutgoRepository;
    private final FixedOutgoMapper fixedOutgoMapper;
    private final JwtTokenizer jwtTokenizer;
    private final MemberService memberService;
    private final TokenBlackListService tokenBlackListService;


    // POST
    public void createFixedOutgo (String token, FixedOutgoDto.Post fixedOutgoDto) {
        tokenBlackListService.isBlackListed(token);

        FixedOutgo fixedOutgo = fixedOutgoMapper.FixedOutgoPostDtoToFixedOutgo(fixedOutgoDto);
        Member member = memberService.findVerifiedMember(jwtTokenizer.getMemberId(token));

        fixedOutgo.setMember(member);
        fixedOutgoRepository.save(fixedOutgo);
    }

    // PATCH
    public void updateFixedOutgo (String token, long fixedOutgoId, FixedOutgoDto.Patch fixedOutgoDto){
        tokenBlackListService.isBlackListed(token);

        FixedOutgo findFixedOutgo = findVerifiedFixedOutgo(fixedOutgoId);
        FixedOutgo fixedOutgo = fixedOutgoMapper.FixedOutgoPatchDtoToFixedOutgo(fixedOutgoDto);
        memberService.verifiedRequest(token, findFixedOutgo.getMember().getMemberId());

        Optional.ofNullable(fixedOutgo.getDate()).ifPresent(findFixedOutgo::setDate);
        Optional.ofNullable(fixedOutgo.getMoney()).ifPresent(findFixedOutgo::setMoney);
        Optional.ofNullable(fixedOutgo.getOutgoName()).ifPresent(findFixedOutgo::setOutgoName);

        fixedOutgoRepository.save(findFixedOutgo);
    }

    // GET
    public MultiResponseDto<FixedOutgoDto.Response> findAllFixedOutgos (String token, int page, int size, String date){
        tokenBlackListService.isBlackListed(token);
        long memberId = jwtTokenizer.getMemberId(token);

        Page<FixedOutgo> fixedOutgoPage;

        // 월, 일별조회를 위한 변수선언
        LocalDate startDate;
        LocalDate endDate;

        // 1. 조회할 날짜 지정
        // date 끝자리에 00 입력시 월별 조회
        if (date.endsWith("00")) { // 2012-11-01
            LocalDate parsedDate = LocalDate.parse(date.substring(0, 7) + "-01");
            startDate = parsedDate.withDayOfMonth(1);
            endDate = parsedDate.withDayOfMonth(parsedDate.lengthOfMonth());
        } // 그외 경우 일별 조회
        else {
            startDate = LocalDate.parse(date);
            endDate = startDate;
        }

        fixedOutgoPage = fixedOutgoRepository.findAllByMemberMemberIdAndDateBetween(
                memberId, startDate, endDate, PageRequest.of(page - 1, size, Sort.by("date").descending()));

        List<FixedOutgoDto.Response> fixedOutgoDtoList = fixedOutgoPage.getContent().stream()
                .map(fixedOutgoMapper::FixedOutgoToFixedOutgoResponseDto)
                .collect(Collectors.toList());

        return new MultiResponseDto<>(fixedOutgoDtoList, fixedOutgoPage);
    }

    // DELETE
    public void deleteFixedOutgo (String token, long fixedOutgoId){
        tokenBlackListService.isBlackListed(token);

        FixedOutgo fixedOutgo = findVerifiedFixedOutgo(fixedOutgoId);
        memberService.verifiedRequest(token, fixedOutgo.getMember().getMemberId());

        fixedOutgoRepository.delete(fixedOutgo);
    }

    public FixedOutgo findVerifiedFixedOutgo (long fixedOutgoId){
        return fixedOutgoRepository.findById(fixedOutgoId).orElseThrow(
                () -> new BusinessLogicException(ExceptionCode.FIXED_OUTGO_NOT_FOUND));
    }
}
