package com.codemouse.salog.members.mapper;

import com.codemouse.salog.members.dto.MemberDto;
import com.codemouse.salog.members.entity.Member;
import com.codemouse.salog.tags.ledgerTags.dto.LedgerTagDto;
import com.codemouse.salog.tags.ledgerTags.entity.LedgerTag;
import com.codemouse.salog.tags.ledgerTags.mapper.LedgerTagMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.ReportingPolicy;
import org.mapstruct.factory.Mappers;

import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE, uses = LedgerTagMapper.class)
public interface MemberMapper {

    Member memberPostDtoToMember(MemberDto.Post requestBody);

    Member memberPatchDtoToMember(MemberDto.Patch requestBody);

    @Mapping(source = "member", target = "incomeTags", qualifiedByName = "toIncomeTagList")
    @Mapping(source = "member", target = "outgoTags", qualifiedByName = "toOutgoTagList")
    MemberDto.Response memberToMemberResponseDto(Member member);

    @Named("toIncomeTagList")
    default List<LedgerTagDto.Response> toIncomeTagList(Member member) {
        return member.getLedgerTags().stream()
                .filter(tag -> tag.getCategory() == LedgerTag.Group.INCOME)
                .map(tag -> Mappers.getMapper(LedgerTagMapper.class).ledgerTagToLedgerTagResponseDto(tag))
                .collect(Collectors.toList());
    }

    @Named("toOutgoTagList")
    default List<LedgerTagDto.Response> toOutgoTagList(Member member) {
        return member.getLedgerTags().stream()
                .filter(tag -> tag.getCategory() == LedgerTag.Group.OUTGO)
                .map(tag -> Mappers.getMapper(LedgerTagMapper.class).ledgerTagToLedgerTagResponseDto(tag))
                .collect(Collectors.toList());
    }
}
