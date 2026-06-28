package com.kaiju.store.repository;

import com.kaiju.store.enums.ProductStatus;
import com.kaiju.store.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {
    Page<Product> findByStatus(ProductStatus status, Pageable pageable);

    Page<Product> findByStatusAndCategoryId(ProductStatus status, Long categoryId, Pageable pageable);

    Page<Product> findBySellerId(Long sellerId, Pageable pageable);

    Page<Product> findByStatusAndSellerId(ProductStatus status, Long sellerId, Pageable pageable);

    List<Product> findBySellerIdAndStatus(Long sellerId, ProductStatus status);

    // Trending: top sản phẩm APPROVED sắp xếp theo view_count giảm dần
    @Query("SELECT p FROM Product p WHERE p.status = 'APPROVED' ORDER BY p.viewCount DESC")
    List<Product> findTrendingProducts(Pageable pageable);
}
