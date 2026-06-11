package com.kaiju.store.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.kaiju.store.repository.ApiResponse;
import com.kaiju.store.service.AdminService;
import com.kaiju.store.service.ProductService;
import com.kaiju.store.service.OrderService;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private ProductService productService;

    @Autowired
    private OrderService orderService;

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getUsers(
            @RequestParam(required = false) String role,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(new ApiResponse<>("success", null, adminService.getUsers(role, page, size)));
    }

    @GetMapping("/products")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getProducts(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(new ApiResponse<>("success", null, productService.getAdminProducts(status, page, size)));
    }

    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getOrders(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(new ApiResponse<>("success", null, orderService.getAllOrders(page, size)));
    }

    @PutMapping("/products/{id}/status")
    public ResponseEntity<ApiResponse<Void>> updateProductStatus(@PathVariable Long id, @RequestBody Map<String, String> request) {
        productService.updateProductStatus(id, request.get("status"));
        return ResponseEntity.ok(new ApiResponse<>("success", "Cập nhật trạng thái sản phẩm thành công.", null));
    }
}
