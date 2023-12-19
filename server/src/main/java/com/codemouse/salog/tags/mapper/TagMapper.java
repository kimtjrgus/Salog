package com.codemouse.salog.tags.mapper;

import com.codemouse.salog.tags.dto.TagDto;
import com.codemouse.salog.tags.entity.DiaryTag;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface TagMapper {
    DiaryTag DiaryTagPostDtoToTag(TagDto.DiaryPost requestBody);


    // Response
    TagDto.DiaryResponse TagToDiaryTagResponseDto(DiaryTag diaryTag);
}
