package com.kaiju.gamewiki.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data // Tự tạo Getter/Setter (cần dependency Lombok)
public class Todo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String title;
    private boolean completed;
}