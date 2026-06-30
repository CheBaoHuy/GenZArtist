package com.kaiju.store.controller;

import com.kaiju.store.model.User;
import com.kaiju.store.repository.ApiResponse;
import com.kaiju.store.repository.CustomOrderRequest;
import com.kaiju.store.repository.OrderRequest;
import com.kaiju.store.service.OrderService;
import com.kaiju.store.util.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    // Đặt đơn: bắt buộc cọc trước 30%
    @PostMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> placeOrder(@RequestBody OrderRequest request) {
        User buyer = SecurityUtils.getCurrentUser();
        Map<String, Object> data = orderService.createOrder(buyer, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                new ApiResponse<>("success", "Đặt cọc 30% thành công. Đơn hàng đã được tạo.", data));
    }

    // Lịch sử đơn hàng của buyer hiện tại (kèm tiến độ từng đơn)
    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> myOrders(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        User buyer = SecurityUtils.getCurrentUser();
        Map<String, Object> data = orderService.getOrderHistory(buyer, page, size);
        return ResponseEntity.ok(new ApiResponse<>("success", null, data));
    }

    // Đặt đơn vẽ theo yêu cầu (custom art order): cũng cọc trước 30%
    @PostMapping("/custom")
    public ResponseEntity<ApiResponse<Map<String, Object>>> placeCustomOrder(@RequestBody CustomOrderRequest request) {
        User buyer = SecurityUtils.getCurrentUser();
        Map<String, Object> data = orderService.createCustomOrder(buyer, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                new ApiResponse<>("success", "Tạo đơn vẽ theo yêu cầu thành công. Vui lòng đặt cọc 30%.", data));
    }

    // Tải hình kết quả (chỉ khi đã thanh toán đủ 100%)
    @GetMapping("/{id}/result-image")
    public ResponseEntity<ApiResponse<Map<String, Object>>> downloadResultImage(@PathVariable String id) {
        User buyer = SecurityUtils.getCurrentUser();
        Map<String, Object> data = orderService.getResultImageForBuyer(buyer, id);
        return ResponseEntity.ok(new ApiResponse<>("success", null, data));
    }

    // Buyer xác nhận hoàn tất -> đóng đơn
    @PutMapping("/{id}/close")
    public ResponseEntity<ApiResponse<Map<String, Object>>> closeOrder(@PathVariable String id) {
        User buyer = SecurityUtils.getCurrentUser();
        Map<String, Object> data = orderService.closeOrder(buyer, id);
        return ResponseEntity.ok(new ApiResponse<>("success", "Đơn hàng đã hoàn tất.", data));
    }

    // Thanh toán 70% còn lại sau khi nhận hàng và hài lòng
    @PutMapping("/{id}/pay-remaining")
    public ResponseEntity<ApiResponse<Map<String, Object>>> payRemaining(@PathVariable String id) {
        User buyer = SecurityUtils.getCurrentUser();
        Map<String, Object> data = orderService.payRemaining(buyer, id);
        return ResponseEntity.ok(new ApiResponse<>("success", "Thanh toán 70% còn lại thành công. Đơn hàng hoàn tất.", data));
    }

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