package com.kaiju.store.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.kaiju.store.repository.ApiResponse;
import com.kaiju.store.repository.ProductPublishRequest;
import com.kaiju.store.repository.RevenueBarResponse;
import com.kaiju.store.repository.RevenuePieResponse;
import com.kaiju.store.service.ProductService;
import com.kaiju.store.service.OrderService;
import com.kaiju.store.service.SellerStatsService;
import com.kaiju.store.util.SecurityUtils;
import com.kaiju.store.model.User;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/seller")
public class SellerController {

    @Autowired
    private ProductService productService;

    @Autowired
    private OrderService orderService;

    @Autowired
    private SellerStatsService sellerStatsService;

    @GetMapping("/products")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSellerProducts(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        User seller = SecurityUtils.getCurrentUser();
        return ResponseEntity.ok(new ApiResponse<>("success", null, productService.getSellerProducts(seller, page, size)));
    }

    @PostMapping("/products")
    public ResponseEntity<ApiResponse<Map<String, Object>>> publishProduct(@RequestBody ProductPublishRequest request) {
        User seller = SecurityUtils.getCurrentUser();
        Map<String, Object> data = productService.publishProduct(seller, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                new ApiResponse<>("success", "Sản phẩm đã được gửi lên hệ thống. Đang chờ phê duyệt từ Admin.", data));
    }

    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSellerOrders(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        User seller = SecurityUtils.getCurrentUser();
        return ResponseEntity.ok(new ApiResponse<>("success", null, orderService.getSellerOrders(seller, page, size)));
    }

    // Danh sách đơn vẽ theo yêu cầu được đặt cho hoạ sĩ (seller) hiện tại
    @GetMapping("/custom-orders")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getArtistOrders(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        User seller = SecurityUtils.getCurrentUser();
        return ResponseEntity.ok(new ApiResponse<>("success", null, orderService.getArtistOrders(seller, page, size)));
    }

    // Cập nhật tay tiến độ một đơn vẽ (bước 10%)
    @PutMapping("/custom-orders/{id}/progress")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateProgress(
            @PathVariable String id, @RequestBody Map<String, Object> body) {
        User seller = SecurityUtils.getCurrentUser();
        Integer progress = body.get("progress") != null
                ? Integer.valueOf(body.get("progress").toString()) : null;
        Map<String, Object> data = orderService.updateCustomOrderProgress(seller, id, progress);
        return ResponseEntity.ok(new ApiResponse<>("success", "Cập nhật tiến độ thành công.", data));
    }

    // Upload hình kết quả (tranh hoàn thiện) cho đơn vẽ
    @PutMapping("/custom-orders/{id}/result-image")
    public ResponseEntity<ApiResponse<Map<String, Object>>> uploadResultImage(
            @PathVariable String id, @RequestBody Map<String, Object> body) {
        User seller = SecurityUtils.getCurrentUser();
        String imageUrl = body.get("imageUrl") != null ? body.get("imageUrl").toString() : null;
        Map<String, Object> data = orderService.uploadResultImage(seller, id, imageUrl);
        return ResponseEntity.ok(new ApiResponse<>("success", "Đã upload hình kết quả.", data));
    }

    @GetMapping("/stats/revenue-bar")
    public ResponseEntity<ApiResponse<RevenueBarResponse>> getRevenueBar(
            @RequestParam String type,
            @RequestParam String startDate,
            @RequestParam String endDate) {
        User seller = SecurityUtils.getCurrentUser();
        return ResponseEntity.ok(new ApiResponse<>("success", null, sellerStatsService.getRevenueBar(seller, type, startDate, endDate)));
    }

    @GetMapping("/stats/revenue-pie")
    public ResponseEntity<ApiResponse<RevenuePieResponse>> getRevenuePie(
            @RequestParam int month,
            @RequestParam int year) {
        User seller = SecurityUtils.getCurrentUser();
        return ResponseEntity.ok(new ApiResponse<>("success", null, sellerStatsService.getRevenuePie(seller, month, year)));
    }
}
