package com.kaiju.store.repository;

import com.kaiju.store.enums.OrderStatus;
import com.kaiju.store.model.OrderItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    @Query("SELECT oi FROM OrderItem oi JOIN FETCH oi.order o JOIN FETCH oi.product p WHERE p.seller.id = :sellerId ORDER BY o.createdAt DESC")
    List<OrderItem> findBySellerId(@Param("sellerId") Long sellerId, Pageable pageable);

    @Query("SELECT COUNT(DISTINCT oi.order.id) FROM OrderItem oi WHERE oi.product.seller.id = :sellerId")
    long countDistinctOrdersBySellerId(@Param("sellerId") Long sellerId);

    // Kiểm tra người dùng đã mua (và đã thanh toán xong) sản phẩm này chưa
    @Query("SELECT CASE WHEN COUNT(oi) > 0 THEN true ELSE false END FROM OrderItem oi " +
            "WHERE oi.order.buyer.id = :buyerId AND oi.product.id = :productId " +
            "AND oi.order.orderStatus = :status")
    boolean existsCompletedPurchase(@Param("buyerId") Long buyerId,
                                    @Param("productId") Long productId,
                                    @Param("status") OrderStatus status);

    default boolean existsCompletedPurchase(Long buyerId, Long productId) {
        return existsCompletedPurchase(buyerId, productId, OrderStatus.COMPLETED);
    }
}
