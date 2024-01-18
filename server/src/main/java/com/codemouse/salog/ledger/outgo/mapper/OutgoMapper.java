package com.codemouse.salog.ledger.outgo.mapper;

import com.codemouse.salog.ledger.outgo.dto.OutgoDto;
import com.codemouse.salog.ledger.outgo.entity.Outgo;
import com.codemouse.salog.tags.ledgerTags.mapper.LedgerTagMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", uses = LedgerTagMapper.class, unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface OutgoMapper {
    Outgo OutgoPostDtoToOutgo(OutgoDto.Post requestBody);
    Outgo OutgoPatchDtoToOutgo(OutgoDto.Patch requestBody);

    @Mapping(source = "ledgerTag", target = "outgoTag", qualifiedByName = "ledgerTagToLedgerTagResponseDto")
    OutgoDto.Response OutgoToOutgoResponseDto(Outgo outgo);

    default OutgoDto.SumByLedgerTag mapToSumByTag(Object[] result) {
        long ledgerTagId = ((Number) result[0]).longValue();
        String tagName = (String) result[1];
        long tagSum = ((Number) result[2]).longValue();

        return new OutgoDto.SumByLedgerTag(ledgerTagId, tagName, tagSum);
    }
}
