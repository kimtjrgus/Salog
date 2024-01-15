package com.codemouse.salog.members.mapper;

import com.codemouse.salog.members.dto.MemberDto;
import com.codemouse.salog.members.entity.Member;
import com.codemouse.salog.tags.ledgerTags.dto.LedgerTagDto;
import com.codemouse.salog.tags.ledgerTags.entity.LedgerTag;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface MemberMapper {
    Member memberPostDtoToMember(MemberDto.Post requestBody);
    Member memberPatchDtoToMember(MemberDto.Patch requestBody);
    default MemberDto.Response memberToMemberResponseDto(Member member) {
        MemberDto.Response response = new MemberDto.Response();

        response.setMemberId(member.getMemberId());
        response.setEmailAlarm(member.isEmailAlarm());
        response.setHomeAlarm(member.isHomeAlarm());
        response.setCreatedAt(member.getCreatedAt());

        List<LedgerTagDto.Response> incomeTags = member.getLedgerTags().stream()
                .filter(tag -> tag.getCategory() == LedgerTag.Group.INCOME)
                .map(this::ledgerTagToLedgerTagResponseDto)
                .collect(Collectors.toList());
        response.setIncomeTags(incomeTags);

        List<LedgerTagDto.Response> outgoTags = member.getLedgerTags().stream()
                .filter(tag -> tag.getCategory() == LedgerTag.Group.OUTGO)
                .map(this::ledgerTagToLedgerTagResponseDto)
                .collect(Collectors.toList());
        response.setOutgoTags(outgoTags);

        return response;
    }

    default LedgerTagDto.Response ledgerTagToLedgerTagResponseDto(LedgerTag ledgerTag) {
        LedgerTagDto.Response response = new LedgerTagDto.Response();
        response.setLedgerTagId(ledgerTag.getLedgerTagId());
        response.setTagName(ledgerTag.getTagName());
        return response;
    }
}
