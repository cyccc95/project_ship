package com.pro.controller;

import com.pro.service.PredictedAisService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
public class PredictedAisController {

    private final PredictedAisService predictedAisService;

    @GetMapping("/api/predict/ship/{mmsi}")
    public ResponseEntity<?> findAllByMmsi(@PathVariable int mmsi) {
        return new ResponseEntity<>(predictedAisService.findAllByMmsi(mmsi), HttpStatus.OK);
    }

    @PostMapping("/api/predict/ship/{mmsi}")
    public ResponseEntity<?> predictAisByMmsi(@PathVariable int mmsi) {
        return new ResponseEntity<>(predictedAisService.predictAisByMmsi(mmsi), HttpStatus.CREATED);
    }

    @DeleteMapping("/api/predict/ship/{mmsi}")
    public ResponseEntity<?> deletePredictedAisByMmsi(@PathVariable int mmsi) {
        return new ResponseEntity<>(predictedAisService.deletePredictedAisByMmsi(mmsi), HttpStatus.OK);
    }
}
