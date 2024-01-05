package com.codemouse.salog.ledger.outgo.mapper;

import com.codemouse.salog.ledger.outgo.dto.OutgoDto;
import com.codemouse.salog.ledger.outgo.entity.Outgo;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface OutgoMapper {
    Outgo OutgoPostDtoToOutgo(OutgoDto.Post requestBody);
    Outgo OutgoPatchDtoToOutgo(OutgoDto.Patch requestBody);
    OutgoDto.Response OutgoToOutgoResponseDto(Outgo outgo);
}
