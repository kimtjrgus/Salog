package com.codemouse.salog.tags.mapper;

import com.codemouse.salog.tags.dto.DiaryTagDto;
import com.codemouse.salog.tags.dto.TagDto;
import com.codemouse.salog.tags.entity.DiaryTag;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface DiaryTagMapper {
    DiaryTag DiaryTagPostDtoToDiaryTag(DiaryTagDto.DiaryPost requestBody);


    // Response
    DiaryTagDto.DiaryResponse DiaryTagToDiaryTagResponseDto(DiaryTag diaryTag);
}
