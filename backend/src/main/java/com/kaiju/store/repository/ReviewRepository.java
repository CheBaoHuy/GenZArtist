package com.kaiju.store.repository;

import com.kaiju.store.model.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    Page<Review> findByProductId(Long productId, Pageable pageable);

    // Kiểm tra user đã review sản phẩm này chưa (mỗi user chỉ review 1 lần)
    Optional<Review> findByReviewerIdAndProductId(Long reviewerId, Long productId);

    // Trung bình rating + tổng số review của 1 sản phẩm
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.product.id = :productId")
    Double avgRatingByProduct(@Param("productId") Long productId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.product.id = :productId")
    Long countByProduct(@Param("productId") Long productId);

}
