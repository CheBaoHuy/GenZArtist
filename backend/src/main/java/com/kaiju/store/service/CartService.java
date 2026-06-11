package com.kaiju.store.service;

import com.kaiju.store.model.*;
import com.kaiju.store.repository.CartItemRepository;
import com.kaiju.store.repository.CartRepository;
import com.kaiju.store.repository.CartItemRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private ProductService productService;

    @Transactional
    public Map<String, Object> addToCart(User buyer, CartItemRequest request) {
        Product product = productService.findById(request.getProductId());

        Cart cart = cartRepository.findByBuyerId(buyer.getId()).orElseGet(() -> {
            Cart newCart = new Cart();
            newCart.setBuyer(buyer);
            return cartRepository.save(newCart);
        });

        CartItem cartItem = cartItemRepository.findByCartIdAndProductId(cart.getId(), product.getId())
                .orElseGet(() -> {
                    CartItem item = new CartItem();
                    item.setCart(cart);
                    item.setProduct(product);
                    item.setQuantity(0);
                    return item;
                });

        cartItem.setQuantity(cartItem.getQuantity() + request.getQuantity());
        cartItem = cartItemRepository.save(cartItem);

        int totalItems = cartItemRepository.findByCartId(cart.getId()).stream()
                .mapToInt(CartItem::getQuantity)
                .sum();

        Map<String, Object> data = new HashMap<>();
        data.put("cartItemId", cartItem.getId());
        data.put("productId", product.getId());
        data.put("quantity", cartItem.getQuantity());
        data.put("totalCartItems", totalItems);
        return data;
    }

    public Map<String, Object> getCart(User buyer) {
        Cart cart = cartRepository.findByBuyerId(buyer.getId())
                .orElse(null);

        Map<String, Object> data = new HashMap<>();
        if (cart == null) {
            data.put("items", java.util.List.of());
            data.put("totalItems", 0);
            data.put("totalPrice", 0);
            return data;
        }

        var items = cartItemRepository.findByCartId(cart.getId());
        int totalItems = 0;
        java.math.BigDecimal totalPrice = java.math.BigDecimal.ZERO;
        var itemDtos = new java.util.ArrayList<Map<String, Object>>();

        for (CartItem item : items) {
            int quantity = item.getQuantity();
            java.math.BigDecimal itemTotal = item.getProduct().getPrice().multiply(java.math.BigDecimal.valueOf(quantity));
            totalItems += quantity;
            totalPrice = totalPrice.add(itemTotal);

            Map<String, Object> itemData = new HashMap<>();
            itemData.put("cartItemId", item.getId());
            itemData.put("productId", item.getProduct().getId());
            itemData.put("name", item.getProduct().getName());
            itemData.put("imageUrl", item.getProduct().getImageUrl());
            itemData.put("quantity", quantity);
            itemData.put("unitPrice", item.getProduct().getPrice());
            itemData.put("totalPrice", itemTotal);
            itemDtos.add(itemData);
        }

        data.put("items", itemDtos);
        data.put("totalItems", totalItems);
        data.put("totalPrice", totalPrice);
        return data;
    }

    public void removeFromCart(User buyer, Long cartItemId) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm trong giỏ hàng."));

        if (!cartItem.getCart().getBuyer().getId().equals(buyer.getId())) {
            throw new RuntimeException("Bạn không có quyền xóa sản phẩm này.");
        }

        cartItemRepository.delete(cartItem);
    }

    @Transactional
    public Map<String, Object> updateCartItemQuantity(User buyer, Long cartItemId, Integer quantity) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm trong giỏ hàng."));

        if (!cartItem.getCart().getBuyer().getId().equals(buyer.getId())) {
            throw new RuntimeException("Bạn không có quyền cập nhật sản phẩm này.");
        }

        cartItem.setQuantity(quantity);
        cartItem = cartItemRepository.save(cartItem);

        java.math.BigDecimal subTotal = cartItem.getProduct().getPrice().multiply(java.math.BigDecimal.valueOf(quantity));
        java.math.BigDecimal totalCartAmount = java.math.BigDecimal.ZERO;
        for (CartItem item : cartItemRepository.findByCartId(cartItem.getCart().getId())) {
            totalCartAmount = totalCartAmount.add(item.getProduct().getPrice().multiply(java.math.BigDecimal.valueOf(item.getQuantity())));
        }

        Map<String, Object> data = new HashMap<>();
        data.put("cartItemId", cartItem.getId());
        data.put("productId", cartItem.getProduct().getId());
        data.put("quantity", cartItem.getQuantity());
        data.put("unitPrice", cartItem.getProduct().getPrice());
        data.put("subTotal", subTotal);
        data.put("totalCartAmount", totalCartAmount);
        return data;
    }
}
