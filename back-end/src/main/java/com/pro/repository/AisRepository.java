package com.pro.repository;

import com.pro.domain.Ais;
import com.pro.domain.AisKey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface AisRepository extends JpaRepository<Ais, AisKey> {

    @Query(value = "select * from (\n" +
            "\tselect * from ais order by mmsi, signal_date DESC limit 18446744073709551615\n" +
            "    ) as recent_ais group by mmsi", nativeQuery = true)
    List<Ais> findAllRecentAis();

    @Query(value = "select * from (\n" +
            "\tselect ais.signal_date, ais.cog, ais.posX, ais.posY, ais.sog, ais.mmsi, ship.shipType from ais inner join ship ship on ais.mmsi = ship.mmsi and ship.shipType = ?1 order by ais.mmsi, signal_date DESC limit 18446744073709551615\n" +
            "    ) as recent_ais group by mmsi", nativeQuery = true)
    List<Ais> findAllRecentAisByShipType(Integer shipType);

    @Query(value = "select * from ais where mmsi = ?1 order by signal_date DESC limit 1", nativeQuery = true)
    Ais findRecentAisByMmsi(Integer mmsi);

    @Query(value = "select * from ais where mmsi = ?1 order by signal_date", nativeQuery = true)
    List<Ais> findAllAisByMmsi(Integer mmsi);

    @Query(value = "select * from (select * from ais order by mmsi, signal_date DESC limit 18446744073709551615) as recent_ais group by mmsi having timestampdiff(MINUTE, signal_date, current_timestamp) >= 5", nativeQuery = true)
    List<Ais> findAllAisLoss();

    @Query(value = "select * from ais where mmsi=?1 order by signal_date DESC limit 2", nativeQuery = true)
    List<Ais> findAisByMmsiLimit2(Integer mmsi);
}
