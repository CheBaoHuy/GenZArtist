package com.kaiju.gamewiki.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "skills")
public class Skill {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String keyBinding; // Q, W, E, R, Passive

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne
    @JoinColumn(name = "champion_id")
    private Champion champion;
}