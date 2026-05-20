package com.kaiju.gamewiki.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "items")
public class Item {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String itemName;
    private Integer goldCost; // Giá tiền
    private String stats; // Ví dụ: +65 AD, +20% Crit

    @Column(columnDefinition = "TEXT")
    private String passiveEffect; // Nội tại trang bị
}