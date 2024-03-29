package com.codemouse.salog.tags.diaryTags.mapper;

import com.codemouse.salog.tags.diaryTags.dto.DiaryTagDto;
import com.codemouse.salog.tags.diaryTags.entity.DiaryTag;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface DiaryTagMapper {
    DiaryTag DiaryTagPostDtoToDiaryTag(DiaryTagDto.Post requestBody);


    // Response
    DiaryTagDto.Response DiaryTagToDiaryTagResponseDto(DiaryTag diaryTag);
}
