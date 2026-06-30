package com.kaiju.store.repository;

import com.kaiju.store.enums.OrderStatus;
import com.kaiju.store.model.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderRepository extends JpaRepository<Order, String> {
    Page<Order> findByBuyerIdOrderByCreatedAtDesc(Long buyerId, Pageable pageable);

    Page<Order> findByOrderStatus(OrderStatus orderStatus, Pageable pageable);

    // Đơn vẽ theo yêu cầu được đặt cho 1 hoạ sĩ (artist) cụ thể
    Page<Order> findByArtistIdAndCustomOrderTrueOrderByCreatedAtDesc(Long artistId, Pageable pageable);
}
