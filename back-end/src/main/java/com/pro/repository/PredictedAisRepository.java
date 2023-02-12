package com.pro.repository;

import com.pro.domain.PredictedAis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface PredictedAisRepository extends JpaRepository<PredictedAis, Long> {

    @Query(value = "select * from predictedais where mmsi=?1 order by predict_date", nativeQuery = true)
    List<PredictedAis> findAllByMmsi(Integer mmsi);

    @Query(value = "select * from predictedAis where mmsi=?1 order by predict_date DESC limit 1", nativeQuery = true)
    PredictedAis findRecentByMmsi(Integer mmsi);

    @Modifying
    @Query(value = "delete from predictedAis where mmsi=?1", nativeQuery = true)
    int deletePredictedAisByMmsi(Integer mmsi);
}
