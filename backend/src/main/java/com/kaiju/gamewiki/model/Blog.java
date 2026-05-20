package com.kaiju.gamewiki.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "blogs")
@Data
public class Blog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title; // Tiêu đề bài viết (VD: Cách chơi Yasuo mùa 14)

    @Column(columnDefinition = "TEXT")
    private String content; // Nội dung build, bảng ngọc, trang bị...

    private String imageUrl; // Đường dẫn ảnh minh họa

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}