package com.kaiju.store.controller;

import com.kaiju.store.repository.ApiResponse;
import com.kaiju.store.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminReviewController {

    @Autowired
    private ReviewService reviewService;

    // ===================== ĐÁNH GIÁ SẢN PHẨM =====================

    @GetMapping("/product-reviews")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getProductReviews(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(new ApiResponse<>("success", null, reviewService.getProductReviews(page, size)));
    }

    @GetMapping("/product-reviews/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getProductReview(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse<>("success", null, reviewService.getProductReview(id)));
    }

    @PostMapping("/product-reviews")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createProductReview(@RequestBody Map<String, Object> request) {
        Map<String, Object> created = reviewService.createProductReview(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>("success", "Tạo đánh giá sản phẩm thành công.", created));
    }

    @PutMapping("/product-reviews/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateProductReview(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        Map<String, Object> updated = reviewService.updateProductReview(id, request);
        return ResponseEntity.ok(new ApiResponse<>("success", "Cập nhật đánh giá sản phẩm thành công.", updated));
    }

    @DeleteMapping("/product-reviews/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProductReview(@PathVariable Long id) {
        reviewService.deleteProductReview(id);
        return ResponseEntity.ok(new ApiResponse<>("success", "Xóa đánh giá sản phẩm thành công.", null));
    }

    // ===================== ĐÁNH GIÁ TÁC GIẢ =====================

    @GetMapping("/author-reviews")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAuthorReviews(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(new ApiResponse<>("success", null, reviewService.getAuthorReviews(page, size)));
    }

    @GetMapping("/author-reviews/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAuthorReview(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse<>("success", null, reviewService.getAuthorReview(id)));
    }

    @PostMapping("/author-reviews")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createAuthorReview(@RequestBody Map<String, Object> request) {
        Map<String, Object> created = reviewService.createAuthorReview(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>("success", "Tạo đánh giá tác giả thành công.", created));
    }

    @PutMapping("/author-reviews/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateAuthorReview(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        Map<String, Object> updated = reviewService.updateAuthorReview(id, request);
        return ResponseEntity.ok(new ApiResponse<>("success", "Cập nhật đánh giá tác giả thành công.", updated));
    }

    @DeleteMapping("/author-reviews/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAuthorReview(@PathVariable Long id) {
        reviewService.deleteAuthorReview(id);
        return ResponseEntity.ok(new ApiResponse<>("success", "Xóa đánh giá tác giả thành công.", null));
    }
}
