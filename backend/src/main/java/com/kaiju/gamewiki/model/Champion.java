package com.kaiju.gamewiki.model;

import com.kaiju.gamewiki.enums.Role;
import jakarta.persistence.*;
import lombok.Data; // Nếu bạn dùng Thư viện Lombok để tự tạo Getter/Setter
import java.util.List;

@Entity
@Table(name = "champions")
@Data
public class Champion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    private String title;

    @Enumerated(EnumType.STRING)
    private Role role;

    @Column(columnDefinition = "TEXT")
    private String lore;

    // Quan hệ 1 tướng - nhiều kỹ năng
    @OneToMany(mappedBy = "champion", cascade = CascadeType.ALL)
    private List<Skill> skills;
}