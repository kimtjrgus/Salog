package com.codemouse.salog.ledger.outgo.service;

import com.codemouse.salog.auth.jwt.JwtTokenizer;
import com.codemouse.salog.auth.utils.TokenBlackListService;
import com.codemouse.salog.dto.MultiResponseDto;
import com.codemouse.salog.exception.BusinessLogicException;
import com.codemouse.salog.exception.ExceptionCode;
import com.codemouse.salog.ledger.outgo.dto.OutgoDto;
import com.codemouse.salog.ledger.outgo.entity.Outgo;
import com.codemouse.salog.ledger.outgo.mapper.OutgoMapper;
import com.codemouse.salog.ledger.outgo.repository.OutgoRepository;
import com.codemouse.salog.members.entity.Member;
import com.codemouse.salog.members.service.MemberService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Slf4j
@AllArgsConstructor
@Transactional
public class OutgoService {
    private final OutgoRepository outgoRepository;
    private final OutgoMapper outgoMapper;
    private final JwtTokenizer jwtTokenizer;
    private final TokenBlackListService tokenBlackListService;
    private final MemberService memberService;


    // POST
    @Transactional
    public void postOutgo (String token, OutgoDto.Post outgoDTO){
        tokenBlackListService.isBlackListed(token);

        Member member = memberService.findVerifiedMember(jwtTokenizer.getMemberId(token));
        Outgo outgo = outgoMapper.OutgoPostDtoToOutgo(outgoDTO);
        outgo.setMember(member);

        outgoRepository.save(outgo);
    }

    // PATCH
    @Transactional
    public void patchOutgo (String token, long outgoId, OutgoDto.Patch outgoDTO){
        tokenBlackListService.isBlackListed(token);

        long memberId = jwtTokenizer.getMemberId(token);

        Outgo findOutgo = findVerifiedOutgo(outgoId);
        verifiedRequest(findOutgo.getMember().getMemberId(), memberId);

        Optional.ofNullable(outgoDTO.getDate()).ifPresent(date -> findOutgo.setDate(LocalDate.parse(date)));
        Optional.ofNullable(outgoDTO.getOutgoName()).ifPresent(findOutgo::setOutgoName);
        Optional.ofNullable(outgoDTO.getMoney()).ifPresent(findOutgo::setMoney);
        Optional.ofNullable(outgoDTO.getMemo()).ifPresent(findOutgo::setMemo);
        Optional.ofNullable(outgoDTO.getOutgoTag()).ifPresent(findOutgo::setOutgoTag);
        Optional.ofNullable(outgoDTO.getReceiptImg()).ifPresent(findOutgo::setReceiptImg);
        Optional.ofNullable(outgoDTO.getWasteList()).ifPresent(findOutgo::setWasteList);

        outgoRepository.save(findOutgo);
    }

    // GET All List
    @Transactional
    public MultiResponseDto<OutgoDto.Response> findAllOutgos (String token, int page, int size, String date, String outgoTag){
        tokenBlackListService.isBlackListed(token);
        long memberId = jwtTokenizer.getMemberId(token);

        Page<Outgo> outgoPage;

        // TODO 태그쿼리 구현X, 태그로직 작성 후 예정
        // 월, 일별조회를 위한 변수선언
        LocalDate startDate;
        LocalDate endDate;

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

        if(outgoTag != null){ // 태그별 조회
            outgoPage = null;
        }
        else{ // none tag
            outgoPage = outgoRepository.findAllByMemberMemberIdAndDateBetween(
                    memberId, startDate, endDate, PageRequest.of(page - 1, size, Sort.by("date").descending()));

        }

        List<OutgoDto.Response> outgoDTOList = outgoPage.getContent().stream()
                .map(outgo -> {
                    OutgoDto.Response response = outgoMapper.OutgoToOutgoResponseDto(outgo);
                    return response;
                })
                .collect(Collectors.toList());

        return new MultiResponseDto<>(outgoDTOList, outgoPage);
    }

    // DELETE
    public void deleteOutgo (String token, long outgoId){
        log.info("Outgo delete requested - token: {}, outgoId: {}", token, outgoId);

        tokenBlackListService.isBlackListed(token);

        long memberId = jwtTokenizer.getMemberId(token);

        Outgo findOutgo = findVerifiedOutgo(outgoId);
        verifiedRequest(findOutgo.getMember().getMemberId(), memberId);

        outgoRepository.deleteById(outgoId);
        log.info("Outgo successfully deleted - memberId: {}, outgoId: {}", memberId, outgoId);
    }

    public Outgo findVerifiedOutgo(long outgoId){
        return outgoRepository.findById(outgoId).orElseThrow(
                () -> new BusinessLogicException(ExceptionCode.OUTGO_NOT_FOUND));
    }

    // 지출을 작성한 멤버가 맞는지 확인하는 메서드 // TODO 공통사항 memberService로 이동시켰으면 함
    private void verifiedRequest(long outgoMemberId, long compareMemberId) {
        if (outgoMemberId != compareMemberId) {
            throw new BusinessLogicException(ExceptionCode.MEMBER_MISMATCHED);
        }
    }
}
