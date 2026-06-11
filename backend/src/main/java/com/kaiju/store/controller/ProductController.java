package com.kaiju.store.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.kaiju.store.service.ProductService;
import com.kaiju.store.repository.ProductDetailResponse;
import com.kaiju.store.repository.ApiResponse;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> listProducts(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "12") int size) {
        return ResponseEntity.ok(new ApiResponse<>("success", null, productService.listApprovedProducts(categoryId, page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductDetailResponse>> getProductById(@PathVariable Long id) {
        ProductDetailResponse product = productService.getProductDetail(id);
        return ResponseEntity.ok(new ApiResponse<>("success", null, product));
    }
}
