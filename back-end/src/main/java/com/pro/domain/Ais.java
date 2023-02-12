package com.pro.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.Column;
import javax.persistence.EmbeddedId;
import javax.persistence.Entity;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class Ais {

    @EmbeddedId
    private AisKey aisKey;

    @Column(nullable = false)
    private double sog;

    @Column(nullable = false)
    private double cog;

    @Column(nullable = false)
    private double posX;

    @Column(nullable = false)
    private double posY;
}
