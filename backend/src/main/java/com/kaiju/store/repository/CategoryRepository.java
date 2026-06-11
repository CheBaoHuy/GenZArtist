package com.kaiju.store.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.kaiju.store.model.Category;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
}