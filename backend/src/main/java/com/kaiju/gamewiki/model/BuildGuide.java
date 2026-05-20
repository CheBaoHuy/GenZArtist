package com.kaiju.gamewiki.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Entity
@Table(name = "build_guides")
public class BuildGuide {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title; // Ví dụ: "Lối chơi Yasuo gánh team"

    @ManyToOne
    @JoinColumn(name = "champion_id")
    private Champion champion; // Chọn tướng

    @ManyToMany
    @JoinTable(name = "guide_items", joinColumns = @JoinColumn(name = "guide_id"), inverseJoinColumns = @JoinColumn(name = "item_id"))
    private List<Item> items; // Chọn danh sách trang bị từ bảng Items

    private String skillOrder; // Ví dụ: "Q -> E -> W"

    @Column(columnDefinition = "TEXT")
    private String notes; // Lưu ý khi chơi (mẹo combo)
}