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
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "newest") String sort) {
        return ResponseEntity.ok(new ApiResponse<>("success", null,
                productService.listApprovedProducts(categoryId, page, size, sort)));
    }

    /**
     * Top sản phẩm trending — dùng cho Home section
     * Mặc định trả 6 sản phẩm có view_count cao nhất
     */
    @GetMapping("/trending")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getTrending(
            @RequestParam(defaultValue = "6") int limit) {
        return ResponseEntity.ok(new ApiResponse<>("success", null,
                productService.getTrendingProducts(limit)));
    }

    /** Chi tiết sản phẩm — tự động tăng view_count */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductDetailResponse>> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse<>("success", null,
                productService.getProductDetail(id)));
    }
}
