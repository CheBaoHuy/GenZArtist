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

    /**
     * Tạo (hoặc cập nhật) đánh giá — cần đăng nhập VÀ đã mua + thanh toán xong sản phẩm.
     * Việc kiểm tra "đã mua" được thực hiện trong ReviewService.
     */
    @PostMapping("/product/{productId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createReview(
            @PathVariable Long productId,
            @RequestBody ReviewRequest body) {
        User currentUser = SecurityUtils.getCurrentUser();
        Map<String, Object> result = reviewService.createOrUpdateProductReview(
                currentUser, productId, body.getRating(), body.getComment());
        return ResponseEntity.ok(new ApiResponse<>("success", "Đánh giá của bạn đã được ghi nhận!", result));
    }

    /** Kiểm tra người dùng hiện tại đã mua / đã đánh giá sản phẩm này chưa — cần đăng nhập */
    @GetMapping("/product/{productId}/my-status")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMyReviewStatus(@PathVariable Long productId) {
        User currentUser = SecurityUtils.getCurrentUser();
        return ResponseEntity.ok(new ApiResponse<>("success", null,
                reviewService.getMyReviewStatus(currentUser, productId)));
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
