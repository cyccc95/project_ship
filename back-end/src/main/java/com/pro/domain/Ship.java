package com.pro.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class Ship {

    @Id
    private int mmsi;

    @Column(nullable = false)
    private String shipName;

    @Column(nullable = false)
    private int shipType;
}
