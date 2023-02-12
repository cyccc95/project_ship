package com.pro.controller;

import com.pro.service.AisService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
public class AisController {

    private final AisService aisService;

    // 모든 선박들의 최신 AIS 데이터
    @GetMapping("/api/ships")
    public ResponseEntity<?> findAllRecentAis() {
        return new ResponseEntity<>(aisService.findAllRecentAis(), HttpStatus.OK);
    }

    // 선박 유형별 모든 선박들의 최신 AIS 데이터
    @GetMapping("/api/ships/shipType/{shipType}")
    public ResponseEntity<?> findAllRecentAisByShipType(@PathVariable int shipType) {
        return new ResponseEntity<>(aisService.findAllRecentAisByShipType(shipType), HttpStatus.OK);
    }

    // mmsi 선박 한 척의 최신 AIS 데이터
    @GetMapping("/api/ship/mmsi/{mmsi}")
    public ResponseEntity<?> findRecentAisByMmsi(@PathVariable int mmsi) {
        return new ResponseEntity<>(aisService.findRecentAisByMmsi(mmsi), HttpStatus.OK);
    }

    // mmsi 선박 한 척의 모든 AIS 데이터
    @GetMapping("/api/ship/route/{mmsi}")
    public ResponseEntity<?> findAllAisByMmsi(@PathVariable int mmsi) {
        return new ResponseEntity<>(aisService.findAllAisByMmsi(mmsi), HttpStatus.OK);
    }

    // 신호 소실 선박들의 최신 AIS 데이터
    @GetMapping("/api/ships/loss")
    public ResponseEntity<?> findAllAisLoss() {
        return new ResponseEntity<>(aisService.findAllAisLoss(), HttpStatus.OK);
    }

}

