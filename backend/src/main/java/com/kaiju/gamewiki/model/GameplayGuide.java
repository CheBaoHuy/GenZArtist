package com.kaiju.gamewiki.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Entity
@Table(name = "gameplay_guides")
public class GameplayGuide {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String guideName; // Ví dụ: Yasuo Mid Full Chí Mạng
    private String position; // Top, Mid, Jung...

    @ManyToOne
    @JoinColumn(name = "champion_id")
    private Champion champion;

    @ManyToMany
    @JoinTable(name = "guide_items", joinColumns = @JoinColumn(name = "guide_id"), inverseJoinColumns = @JoinColumn(name = "item_id"))
    private List<Item> recommendedItems;
}