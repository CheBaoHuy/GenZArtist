package com.kaiju.store.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.kaiju.store.dto.UserDto;
import com.kaiju.store.model.Category;
import com.kaiju.store.repository.ApiResponse;
import com.kaiju.store.service.AdminService;
import com.kaiju.store.service.CategoryService;
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

    @Autowired
    private CategoryService categoryService;

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getUsers(
            @RequestParam(required = false) String role,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(new ApiResponse<>("success", null, adminService.getUsers(role, page, size)));
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<ApiResponse<UserDto>> getUser(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse<>("success", null, adminService.getUserById(id)));
    }

    @PostMapping("/users")
    public ResponseEntity<ApiResponse<UserDto>> createUser(@RequestBody Map<String, Object> request) {
        UserDto created = adminService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>("success", "Tạo người dùng thành công.", created));
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<ApiResponse<UserDto>> updateUser(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        UserDto updated = adminService.updateUser(id, request);
        return ResponseEntity.ok(new ApiResponse<>("success", "Cập nhật người dùng thành công.", updated));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.ok(new ApiResponse<>("success", "Xóa người dùng thành công.", null));
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
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(new ApiResponse<>("success", null, orderService.getAllOrders(status, page, size)));
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getOrder(@PathVariable String id) {
        return ResponseEntity.ok(new ApiResponse<>("success", null, orderService.getAdminOrderDetail(id)));
    }

    @PostMapping("/orders")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createOrder(@RequestBody Map<String, Object> request) {
        Map<String, Object> created = orderService.adminCreateOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>("success", "Tạo đơn hàng thành công.", created));
    }

    @PutMapping("/orders/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateOrder(@PathVariable String id, @RequestBody Map<String, Object> request) {
        Map<String, Object> updated = orderService.adminUpdateOrder(id, request);
        return ResponseEntity.ok(new ApiResponse<>("success", "Cập nhật đơn hàng thành công.", updated));
    }

    @DeleteMapping("/orders/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteOrder(@PathVariable String id) {
        orderService.adminDeleteOrder(id);
        return ResponseEntity.ok(new ApiResponse<>("success", "Xóa đơn hàng thành công.", null));
    }

    @PutMapping("/products/{id}/status")
    public ResponseEntity<ApiResponse<Void>> updateProductStatus(@PathVariable Long id, @RequestBody Map<String, String> request) {
        productService.updateProductStatus(id, request.get("status"));
        return ResponseEntity.ok(new ApiResponse<>("success", "Cập nhật trạng thái sản phẩm thành công.", null));
    }

    @GetMapping("/products/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getProduct(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse<>("success", null, productService.getAdminProductDetail(id)));
    }

    @PostMapping("/products")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createProduct(@RequestBody Map<String, Object> request) {
        Map<String, Object> created = productService.createProduct(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>("success", "Tạo sản phẩm thành công.", created));
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateProduct(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        Map<String, Object> updated = productService.updateProduct(id, request);
        return ResponseEntity.ok(new ApiResponse<>("success", "Cập nhật sản phẩm thành công.", updated));
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(new ApiResponse<>("success", "Xóa sản phẩm thành công.", null));
    }

    @GetMapping("/categories/{id}")
    public ResponseEntity<ApiResponse<Category>> getCategory(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse<>("success", null, categoryService.getById(id)));
    }

    @PostMapping("/categories")
    public ResponseEntity<ApiResponse<Category>> createCategory(@RequestBody Map<String, Object> request) {
        Category created = categoryService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>("success", "Tạo danh mục thành công.", created));
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<ApiResponse<Category>> updateCategory(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        Category updated = categoryService.update(id, request);
        return ResponseEntity.ok(new ApiResponse<>("success", "Cập nhật danh mục thành công.", updated));
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
        categoryService.delete(id);
        return ResponseEntity.ok(new ApiResponse<>("success", "Xóa danh mục thành công.", null));
    }
}
