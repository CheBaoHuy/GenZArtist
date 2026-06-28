package com.kaiju.store.controller;

import com.kaiju.store.model.User;
import com.kaiju.store.repository.ApiResponse;
import com.kaiju.store.service.ReviewService;
import com.kaiju.store.util.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    /** Lấy danh sách reviews của sản phẩm — public */
    @GetMapping("/product/{productId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getProductReviews(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(new ApiResponse<>("success", null,
                reviewService.getProductReviews(productId, page, size)));
    }

    /** Tạo review — cần đăng nhập */
    @PostMapping("/product/{productId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createReview(
            @PathVariable Long productId,
            @RequestBody ReviewRequest body) {
        User currentUser = SecurityUtils.getCurrentUser();
        Map<String, Object> result = reviewService.createProductReview(
                currentUser, productId, body.getRating(), body.getComment());
        return ResponseEntity.ok(new ApiResponse<>("success", "Đánh giá thành công!", result));
    }

    /** Xoá review — owner hoặc admin */
    @DeleteMapping("/{reviewId}")
    public ResponseEntity<ApiResponse<Void>> deleteReview(@PathVariable Long reviewId) {
        User currentUser = SecurityUtils.getCurrentUser();
        reviewService.deleteReview(currentUser, reviewId);
        return ResponseEntity.ok(new ApiResponse<>("success", "Đã xoá đánh giá.", null));
    }

    /** Inner DTO cho request body */
    public static class ReviewRequest {
        private int rating;
        private String comment;

        public int getRating() { return rating; }
        public void setRating(int rating) { this.rating = rating; }
        public String getComment() { return comment; }
        public void setComment(String comment) { this.comment = comment; }
    }
}
