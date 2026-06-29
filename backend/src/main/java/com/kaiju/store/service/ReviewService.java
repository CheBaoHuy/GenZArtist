package com.kaiju.store.service;

import com.kaiju.store.model.Product;
import com.kaiju.store.model.Review;
import com.kaiju.store.model.User;
import com.kaiju.store.repository.ProductRepository;
import com.kaiju.store.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private ProductRepository productRepository;

    /** Lấy danh sách review của một sản phẩm (phân trang, mới nhất trước) */
    public Map<String, Object> getProductReviews(Long productId, int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(page - 1, 0), size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Review> reviewPage = reviewRepository.findByProductId(productId, pageable);

        List<Map<String, Object>> reviews = reviewPage.getContent().stream()
                .map(this::toDto)
                .collect(Collectors.toList());

        Double avgRating = reviewRepository.avgRatingByProduct(productId);
        Long totalReviews = reviewRepository.countByProduct(productId);

        Map<String, Object> data = new HashMap<>();
        data.put("reviews", reviews);
        data.put("avgRating", avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0.0);
        data.put("totalReviews", totalReviews);
        data.put("pagination", Map.of(
                "currentPage", page,
                "totalPages", reviewPage.getTotalPages(),
                "totalElements", reviewPage.getTotalElements()
        ));
        return data;
    }

    /** Tạo review mới cho sản phẩm.
     *  Mỗi user chỉ được review một sản phẩm 1 lần. */
    public Map<String, Object> createProductReview(User reviewer, Long productId, int rating, String comment) {
        // Validate rating
        if (rating < 1 || rating > 5) {
            throw new RuntimeException("Rating phải từ 1 đến 5.");
        }

        // Kiểm tra sản phẩm tồn tại
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm."));

        // Kiểm tra đã review chưa
        reviewRepository.findByReviewerIdAndProductId(reviewer.getId(), productId)
                .ifPresent(r -> { throw new RuntimeException("Bạn đã đánh giá sản phẩm này rồi."); });

        Review review = new Review();
        review.setReviewer(reviewer);
        review.setSeller(product.getSeller());
        review.setProduct(product);
        review.setRating(rating);
        review.setComment(comment != null ? comment.trim() : null);
        review = reviewRepository.save(review);

        return toDto(review);
    }

    /** Xoá review (chỉ chủ review hoặc admin) */
    public void deleteReview(User actor, Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy review."));

        boolean isOwner = review.getReviewer().getId().equals(actor.getId());
        boolean isAdmin = actor.getRole().name().equals("ADMIN");

        if (!isOwner && !isAdmin) {
            throw new RuntimeException("Bạn không có quyền xoá review này.");
        }
        reviewRepository.delete(review);
    }

    private Map<String, Object> toDto(Review r) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", r.getId());
        dto.put("rating", r.getRating());
        dto.put("comment", r.getComment());
        dto.put("createdAt", r.getCreatedAt());

        if (r.getReviewer() != null) {
            Map<String, Object> reviewer = new HashMap<>();
            reviewer.put("id", r.getReviewer().getId());
            reviewer.put("fullName", r.getReviewer().getFullName());
            reviewer.put("avatarUrl", r.getReviewer().getAvatarUrl());
            dto.put("reviewer", reviewer);
        }
        return dto;
    }
}
