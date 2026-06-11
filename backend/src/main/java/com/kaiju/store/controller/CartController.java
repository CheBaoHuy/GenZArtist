package com.kaiju.store.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.kaiju.store.repository.ApiResponse;
import com.kaiju.store.repository.CartItemRequest;
import com.kaiju.store.service.CartService;
import com.kaiju.store.util.SecurityUtils;
import com.kaiju.store.model.User;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/cart")
public class CartController {

    @Autowired
    private CartService cartService;

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCart() {
        User buyer = SecurityUtils.getCurrentUser();
        Map<String, Object> data = cartService.getCart(buyer);
        return ResponseEntity.ok(new ApiResponse<>("success", null, data));
    }

    @PostMapping("/items")
    public ResponseEntity<ApiResponse<Map<String, Object>>> addToCart(@RequestBody CartItemRequest request) {
        User buyer = SecurityUtils.getCurrentUser();
        Map<String, Object> data = cartService.addToCart(buyer, request);
        return ResponseEntity.ok(new ApiResponse<>("success", "Đã thêm sản phẩm vào giỏ hàng thành công.", data));
    }

    @DeleteMapping("/items/{cartItemId}")
    public ResponseEntity<ApiResponse<Void>> removeFromCart(@PathVariable Long cartItemId) {
        User buyer = SecurityUtils.getCurrentUser();
        cartService.removeFromCart(buyer, cartItemId);
        return ResponseEntity.ok(new ApiResponse<>("success", "Đã xóa sản phẩm khỏi giỏ hàng thành công.", null));
    }

    @PutMapping("/items/{cartItemId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateCartItemQuantity(
            @PathVariable Long cartItemId,
            @RequestBody Map<String, Integer> request) {
        User buyer = SecurityUtils.getCurrentUser();
        Map<String, Object> data = cartService.updateCartItemQuantity(buyer, cartItemId, request.get("quantity"));
        return ResponseEntity.ok(new ApiResponse<>("success", "Cập nhật giỏ hàng thành công.", data));
    }
}
