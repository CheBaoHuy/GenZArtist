package com.kaiju.store.repository;

import java.util.List;

public class OrderRequest {
    private String paymentMethod;
    private List<OrderItemDto> items;

    public OrderRequest() {}

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public List<OrderItemDto> getItems() { return items; }
    public void setItems(List<OrderItemDto> items) { this.items = items; }

    public static class OrderItemDto {
        private Long productId;
        private Integer quantity;

        public OrderItemDto() {}

        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }

        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
    }
}