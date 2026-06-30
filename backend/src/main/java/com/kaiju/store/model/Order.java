package com.kaiju.store.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import com.kaiju.store.enums.OrderStatus;
import com.kaiju.store.enums.PaymentPhase;
import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "orders")
public class Order {
    @Id
    private String id; // Mã đơn hàng (VD: ORD-20231105-X7Z)

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "buyer_id", nullable = false)
    private User buyer;

    @Column(nullable = false)
    private BigDecimal totalAmount;

    @Column(nullable = false)
    private String paymentMethod; // VNPAY, MOMO

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus orderStatus = OrderStatus.PENDING;

    private String paymentUrl;

    @Column(name = "payment_status")
    private String paymentStatus = "PENDING";

    // ===== Thanh toán 2 lần: cọc 30% + còn lại 70% =====
    @Column(name = "deposit_amount")
    private BigDecimal depositAmount;   // 30% tổng tiền

    @Column(name = "remaining_amount")
    private BigDecimal remainingAmount; // 70% còn lại

    // Để nullable: tránh lỗi migration khi bảng orders đã có dữ liệu cũ (ddl-auto=update)
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_phase")
    private PaymentPhase paymentPhase = PaymentPhase.UNPAID;

    @Column(name = "deposit_paid_at")
    private LocalDateTime depositPaidAt;

    @Column(name = "final_paid_at")
    private LocalDateTime finalPaidAt;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private List<OrderItem> items;

    // ===== Đơn vẽ theo yêu cầu (custom art order) =====
    // Đơn custom không gắn với Product nào (items rỗng); thông tin yêu cầu lưu trực tiếp ở đây.
    @Column(name = "is_custom_order", nullable = false)
    private boolean customOrder = false;

    @Column(name = "customer_name")
    private String customerName;

    @Column(name = "art_type")
    private String artType;

    @Column(name = "art_style")
    private String style;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "ref_image_url", columnDefinition = "TEXT")
    private String refImageUrl;

    // Hình kết quả (tranh hoàn thiện) hoạ sĩ upload — lưu data URL nên dùng LONGTEXT
    @Column(name = "result_image_url", columnDefinition = "LONGTEXT")
    private String resultImageUrl;

    // Hoạ sĩ được chọn để thực hiện đơn (là một User role SELLER)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "artist_id")
    private User artist;

    // Tiến độ thực hiện (0..100), seller cập nhật tay theo bước 10%
    @Column(name = "progress", nullable = false)
    private int progress = 0;

    public Order() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public User getBuyer() { return buyer; }
    public void setBuyer(User buyer) { this.buyer = buyer; }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public OrderStatus getOrderStatus() { return orderStatus; }
    public void setOrderStatus(OrderStatus orderStatus) { this.orderStatus = orderStatus; }

    public String getPaymentUrl() { return paymentUrl; }
    public void setPaymentUrl(String paymentUrl) { this.paymentUrl = paymentUrl; }

    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }

    public BigDecimal getDepositAmount() { return depositAmount; }
    public void setDepositAmount(BigDecimal depositAmount) { this.depositAmount = depositAmount; }

    public BigDecimal getRemainingAmount() { return remainingAmount; }
    public void setRemainingAmount(BigDecimal remainingAmount) { this.remainingAmount = remainingAmount; }

    public PaymentPhase getPaymentPhase() { return paymentPhase; }
    public void setPaymentPhase(PaymentPhase paymentPhase) { this.paymentPhase = paymentPhase; }

    public LocalDateTime getDepositPaidAt() { return depositPaidAt; }
    public void setDepositPaidAt(LocalDateTime depositPaidAt) { this.depositPaidAt = depositPaidAt; }

    public LocalDateTime getFinalPaidAt() { return finalPaidAt; }
    public void setFinalPaidAt(LocalDateTime finalPaidAt) { this.finalPaidAt = finalPaidAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public List<OrderItem> getItems() { return items; }
    public void setItems(List<OrderItem> items) { this.items = items; }

    public boolean isCustomOrder() { return customOrder; }
    public void setCustomOrder(boolean customOrder) { this.customOrder = customOrder; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getArtType() { return artType; }
    public void setArtType(String artType) { this.artType = artType; }

    public String getStyle() { return style; }
    public void setStyle(String style) { this.style = style; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getRefImageUrl() { return refImageUrl; }
    public void setRefImageUrl(String refImageUrl) { this.refImageUrl = refImageUrl; }

    public String getResultImageUrl() { return resultImageUrl; }
    public void setResultImageUrl(String resultImageUrl) { this.resultImageUrl = resultImageUrl; }

    public User getArtist() { return artist; }
    public void setArtist(User artist) { this.artist = artist; }

    public int getProgress() { return progress; }
    public void setProgress(int progress) { this.progress = progress; }
}