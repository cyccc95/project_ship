package com.pro.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.sql.Timestamp;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class PredictedAis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long predictedAisId;

    @Column(nullable = false)
    private int mmsi;

    @Column(nullable = false)
    private double sog;

    @Column(nullable = false)
    private double cog;

    @Column(nullable = false)
    private double posX;

    @Column(nullable = false)
    private double posY;

    @Column(nullable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private Timestamp predict_date;
}
