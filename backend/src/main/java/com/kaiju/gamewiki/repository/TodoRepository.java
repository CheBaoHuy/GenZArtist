package com.kaiju.gamewiki.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.kaiju.gamewiki.model.Todo;

public interface TodoRepository extends JpaRepository<Todo, Long> {
    // Spring Boot tự động cung cấp các hàm save, findAll, delete...
}