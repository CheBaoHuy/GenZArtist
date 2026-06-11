package com.kaiju.store.controller;

import com.kaiju.store.model.User;
import com.kaiju.store.repository.ApiResponse;
import com.kaiju.store.service.OrderService;
import com.kaiju.store.util.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<Map<String, Object>>> cancelOrder(@PathVariable String id) {
        User currentUser = SecurityUtils.getCurrentUser();
        Map<String, Object> data = orderService.cancelOrder(currentUser, id);
        return ResponseEntity.ok(new ApiResponse<>("success", "Hủy đơn hàng thành công.", data));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateOrderStatus(
            @PathVariable String id, @RequestBody Map<String, String> request) {
        User currentUser = SecurityUtils.getCurrentUser();
        Map<String, Object> data = orderService.updateOrderStatus(currentUser, id, request.get("status"));
        return ResponseEntity.ok(new ApiResponse<>("success", "Cập nhật trạng thái đơn hàng thành công.", data));
    }
}