package com.codemouse.salog.ledger.fixedOutgo.mapper;

import com.codemouse.salog.ledger.fixedOutgo.dto.FixedOutgoDto;
import com.codemouse.salog.ledger.fixedOutgo.entity.FixedOutgo;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface FixedOutgoMapper {
    FixedOutgo FixedOutgoPostDtoToFixedOutgo(FixedOutgoDto.Post requestBody);
    FixedOutgo FixedOutgoPatchDtoToFixedOutgo(FixedOutgoDto.Patch requestBody);
    FixedOutgoDto.Response FixedOutgoToFixedOutgoResponseDto(FixedOutgo fixedOutgo);
}
