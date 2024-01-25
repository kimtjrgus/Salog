package com.codemouse.salog.tags.ledgerTags.mapper;

import com.codemouse.salog.tags.ledgerTags.dto.LedgerTagDto;
import com.codemouse.salog.tags.ledgerTags.entity.LedgerTag;
import org.mapstruct.Mapper;
import org.mapstruct.Named;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface LedgerTagMapper {
    LedgerTag ledgerTagPostDtoToLedgerTag(LedgerTagDto.Post requestBody);

    @Named("ledgerTagToLedgerTagResponseDto")
    LedgerTagDto.Response ledgerTagToLedgerTagResponseDto(LedgerTag ledgerTag);
}
