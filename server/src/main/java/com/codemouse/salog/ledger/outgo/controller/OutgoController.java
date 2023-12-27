package com.codemouse.salog.ledger.outgo.controller;

import com.codemouse.salog.dto.SingleResponseDto;
import com.codemouse.salog.ledger.outgo.dto.OutgoDto;
import com.codemouse.salog.ledger.outgo.service.OutgoService;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import javax.validation.constraints.Positive;

@RestController
@Slf4j
@Validated
@RequestMapping("/outgo")
public class OutgoController {
    private final OutgoService service;

    public OutgoController(OutgoService service) {
        this.service = service;
    }

    // POST
    @PostMapping("/post")
    @ResponseStatus(HttpStatus.CREATED)
    public void createOutgo (@RequestHeader(name = "Authorization") String token,
                             @Valid @RequestBody OutgoDto.Post requestBody){
        service.postOutgo(token, requestBody);
    }

    // PATCH
    @PatchMapping("/update/{outgo-id}")
    @ResponseStatus(HttpStatus.OK)
    public void updateOutgo (@RequestHeader(name = "Authorization") String token,
                             @PathVariable("outgo-id") @Positive long outgoId,
                             @Valid @RequestBody OutgoDto.Patch requestBody){
        service.patchOutgo(token, outgoId, requestBody);
    }

    // GET All List
    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public SingleResponseDto<String> getOutgoLists (@RequestHeader(name = "Authorization") String token,
                                            @Positive @RequestParam int page,
                                            @Positive @RequestParam int size,
                                            @Valid @RequestParam(required = false) String outgoTag,
                                            @Valid @RequestParam(required = false) String date){

        String response = service.findAllOutgos(token, page, size, outgoTag, date);
        return new SingleResponseDto<>(response);
    }

    // DELETE
    @DeleteMapping("/delete/{outgo-id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteOutgo (@RequestHeader(name = "Authorization") String token,
                             @PathVariable("outgo-id") @Positive long outgoId){
        service.deleteOutgo(token, outgoId);
    }
}
