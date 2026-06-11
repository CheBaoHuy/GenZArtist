package com.kaiju.store.controller;

import com.kaiju.store.model.Category;
import com.kaiju.store.repository.ApiResponse;
import com.kaiju.store.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/categories")
public class CategoryController {

    @Autowired
    private CategoryRepository categoryRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Category>>> listCategories() {
        return ResponseEntity.ok(new ApiResponse<>("success", null, categoryRepository.findAll()));
    }
}
