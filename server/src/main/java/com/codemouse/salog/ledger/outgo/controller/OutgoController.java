package com.codemouse.salog.ledger.outgo.controller;

import com.codemouse.salog.dto.MultiResponseDto;
import com.codemouse.salog.dto.SingleResponseDto;
import com.codemouse.salog.ledger.outgo.dto.OutgoDto;
import com.codemouse.salog.ledger.outgo.service.OutgoService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import javax.validation.constraints.Positive;

@RestController
@Slf4j
@Validated
@AllArgsConstructor
public class OutgoController {
    private final OutgoService service;

    @PostMapping("/outgo/post")
    @ResponseStatus(HttpStatus.CREATED)
    public void createOutgo (@RequestHeader(name = "Authorization") String token,
                             @Valid @RequestBody OutgoDto.Post requestBody){
        service.postOutgo(token, requestBody);
    }


    @PatchMapping("/outgo/update/{outgo-id}")
    @ResponseStatus(HttpStatus.OK)
    public void updateOutgo (@RequestHeader(name = "Authorization") String token,
                             @PathVariable("outgo-id") @Positive long outgoId,
                             @Valid @RequestBody OutgoDto.Patch requestBody){
        service.patchOutgo(token, outgoId, requestBody);
    }

    @GetMapping("/outgo")
    public ResponseEntity getOutgoLists (@RequestHeader(name = "Authorization") String token,
                                         @Positive @RequestParam int page,
                                         @Positive @RequestParam int size,
                                         @Valid @RequestParam String date,
                                         @Valid @RequestParam(required = false) String outgoTag){

        MultiResponseDto<OutgoDto.Response> outgoPages =
                service.findAllOutgos(token, page, size, date, outgoTag);
        return new ResponseEntity<>(outgoPages, HttpStatus.OK);
    }

//    @GetMapping("/wasteList")
//    public ResponseEntity getWasteLists (@RequestHeader(name = "Authorization") String token,
//                                         @Positive @RequestParam int page,
//                                         @Positive @RequestParam int size,
//                                         @Valid @RequestParam String date,
//                                         @Valid @RequestParam(required = false) String outgoTag){
//
//        MultiResponseDto<OutgoDto.Response> wastePages =
//                service.findAllWasteLists(token, page, size, date, outgoTag);
//        return new ResponseEntity<>(wastePages, HttpStatus.OK);
//    }

    @GetMapping("/monthlyOutgo")
    public ResponseEntity getSumOfOutgoLists (@RequestHeader(name = "Authorization") String token,
                                    @Valid @RequestParam String date){
        SingleResponseDto sumOfOutgos =
                service.getSumOfOutgoLists(token, date);

        return new ResponseEntity(sumOfOutgos, HttpStatus.OK);
    }

//    @GetMapping("/monthlyWaste")
//    public ResponseEntity getSumOfWasteLists (@RequestHeader(name = "Authorization") String token,
//                                    @Valid @RequestParam String date){
//        SingleResponseDto<OutgoDto.ResponseBySum> sumOfWasteLists =
//                service.getSumOfWasteLists(token, date);
//
//        return new ResponseEntity(sumOfWasteLists, HttpStatus.OK);
//    }

    @DeleteMapping("/outgo/delete/{outgo-id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteOutgo (@RequestHeader(name = "Authorization") String token,
                             @PathVariable("outgo-id") @Positive long outgoId){
        service.deleteOutgo(token, outgoId);
    }
}