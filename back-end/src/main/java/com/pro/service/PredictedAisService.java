package com.pro.service;

import com.pro.domain.Ais;
import com.pro.domain.PredictedAis;
import com.pro.repository.AisRepository;
import com.pro.repository.PredictedAisRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.util.Calendar;
import java.util.List;

@RequiredArgsConstructor
@Service
public class PredictedAisService {

    private final PredictedAisRepository predictedAisRepository;

    private final AisRepository aisRepository;

    @Transactional(readOnly = true)
    public List<PredictedAis> findAllByMmsi(int mmsi) {
        return predictedAisRepository.findAllByMmsi(mmsi);
    }

    @Transactional
    public PredictedAis predictAisByMmsi(int mmsi) {
        List<Ais> aisLimit2 = aisRepository.findAisByMmsiLimit2(mmsi);
        if (aisLimit2.size() < 2){
            return null;
        } else {
            PredictedAis recentPredictedAis = predictedAisRepository.findRecentByMmsi(mmsi);

            PredictedAis predictedAis = new PredictedAis();
            predictedAis.setMmsi(aisLimit2.get(0).getAisKey().getShip().getMmsi());
            predictedAis.setCog(aisLimit2.get(0).getCog());
            predictedAis.setSog(aisLimit2.get(0).getSog());

            Long limit1Time = aisLimit2.get(0).getAisKey().getSignal_date().getTime();
            Long limit2Time = aisLimit2.get(1).getAisKey().getSignal_date().getTime();

            if (recentPredictedAis == null){
                predictedAis.setPosX(aisLimit2.get(0).getPosX() + (aisLimit2.get(0).getPosX() - aisLimit2.get(1).getPosX()) / (limit1Time - limit2Time) * 10000);
                predictedAis.setPosY(aisLimit2.get(0).getPosY() + (aisLimit2.get(0).getPosY() - aisLimit2.get(1).getPosY()) / (limit1Time - limit2Time) * 10000);
            } else {
                predictedAis.setPosX(recentPredictedAis.getPosX() + (aisLimit2.get(0).getPosX() - aisLimit2.get(1).getPosX()) / (limit1Time - limit2Time) * 10000);
                predictedAis.setPosY(recentPredictedAis.getPosY() + (aisLimit2.get(0).getPosY() - aisLimit2.get(1).getPosY()) / (limit1Time - limit2Time) * 10000);
            }

            Timestamp ts = new Timestamp(System.currentTimeMillis());
            Calendar cal = Calendar.getInstance();
            cal.setTime(ts);
            cal.add(Calendar.HOUR, 9);
            ts.setTime(cal.getTime().getTime());
            predictedAis.setPredict_date(ts);
            return predictedAisRepository.save(predictedAis);
        }

    }

    @Transactional
    public String deletePredictedAisByMmsi(int mmsi) {
        predictedAisRepository.deletePredictedAisByMmsi(mmsi);
        return "ok";
    }
}
