package com.pro.service;

import com.pro.domain.Ais;
import com.pro.repository.AisRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@RequiredArgsConstructor
@Service
public class AisService {

    private final AisRepository aisRepository;

    @Transactional(readOnly = true)
    public List<Ais> findAllRecentAis(){
        return aisRepository.findAllRecentAis();
    }

    @Transactional(readOnly = true)
    public List<Ais> findAllRecentAisByShipType(int shipType){
        return aisRepository.findAllRecentAisByShipType(shipType);
    }

    @Transactional(readOnly = true)
    public Ais findRecentAisByMmsi(int mmsi){
        return aisRepository.findRecentAisByMmsi(mmsi);
    }

    @Transactional(readOnly = true)
    public List<Ais> findAllAisByMmsi(int mmsi){
        return aisRepository.findAllAisByMmsi(mmsi);
    }

    @Transactional(readOnly = true)
    public List<Ais> findAllAisLoss(){
        return aisRepository.findAllAisLoss();
    }
}
