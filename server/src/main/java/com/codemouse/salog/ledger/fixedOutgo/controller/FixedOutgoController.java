package com.codemouse.salog.ledger.fixedOutgo.controller;

import com.codemouse.salog.dto.MultiResponseDto;
import com.codemouse.salog.ledger.fixedOutgo.dto.FixedOutgoDto;
import com.codemouse.salog.ledger.fixedOutgo.service.FixedOutgoService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import javax.validation.constraints.Positive;

@RestController
@RequestMapping("/fixedOutgo")
@Validated
@AllArgsConstructor
@Slf4j
public class FixedOutgoController {
    private final FixedOutgoService fixedOutgoService;

    // POST
    @PostMapping("/post")
    public ResponseEntity<?> postFixedOutgo (@RequestHeader(name = "Authorization") String token,
                                @Valid @RequestBody FixedOutgoDto.Post requestBody){
        FixedOutgoDto.Response response = fixedOutgoService.createFixedOutgo(token, requestBody);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // PATCH
    @PatchMapping("/update/{fixedOutgo-id}")
    public ResponseEntity<?> patchFixedOutgo (@RequestHeader(name = "Authorization") String token,
                                 @PathVariable("fixedOutgo-id") @Positive long fixedOutgoId,
                                 @Valid @RequestBody FixedOutgoDto.Patch requestBody){
        FixedOutgoDto.Response response = fixedOutgoService.updateFixedOutgo(token, fixedOutgoId, requestBody);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    // GET
    @GetMapping("/get")
    public ResponseEntity<?> getAllFixedOutgos (@RequestHeader(name = "Authorization") String token,
                                             @Positive @RequestParam int page,
                                             @Positive @RequestParam int size,
                                             @Valid @RequestParam String date){
        MultiResponseDto<FixedOutgoDto.Response> pages =
                fixedOutgoService.findAllFixedOutgos(token, page, size, date);

        return new ResponseEntity<>(pages, HttpStatus.OK);
    }

    // DELETE
    @DeleteMapping("/delete/{fixedOutgo-id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteFixedOutgo (@RequestHeader(name = "Authorization") String token,
                                  @PathVariable("fixedOutgo-id") @Positive long fixedOutgoId){
        fixedOutgoService.deleteFixedOutgo(token, fixedOutgoId);
    }
}
