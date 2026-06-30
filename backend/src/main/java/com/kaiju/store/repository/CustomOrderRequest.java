package com.kaiju.store.repository;

import java.math.BigDecimal;

// Yêu cầu đặt đơn vẽ theo yêu cầu (custom art order)
public class CustomOrderRequest {
    private String customerName;
    private String artType;
    private String style;
    private String description;
    private Long artistId;
    private BigDecimal budget;      // Ngân sách dự kiến (VND) -> tổng tiền đơn
    private String refImageUrl;     // Ảnh minh hoạ (data URL hoặc link), tuỳ chọn
    private String paymentMethod;   // VNPAY (mặc định), MOMO

    public CustomOrderRequest() {}

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getArtType() { return artType; }
    public void setArtType(String artType) { this.artType = artType; }

    public String getStyle() { return style; }
    public void setStyle(String style) { this.style = style; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Long getArtistId() { return artistId; }
    public void setArtistId(Long artistId) { this.artistId = artistId; }

    public BigDecimal getBudget() { return budget; }
    public void setBudget(BigDecimal budget) { this.budget = budget; }

    public String getRefImageUrl() { return refImageUrl; }
    public void setRefImageUrl(String refImageUrl) { this.refImageUrl = refImageUrl; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
}
