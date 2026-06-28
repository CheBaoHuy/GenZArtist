package com.kaiju.store.repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ProductDetailResponse {
    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private String imageUrl;
    private CategoryDto category;
    private Integer viewCount;
    private LocalDateTime createdAt;
    private SellerDto seller;
    private Double avgRating;
    private Long reviewCount;

    public ProductDetailResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public CategoryDto getCategory() { return category; }
    public void setCategory(CategoryDto category) { this.category = category; }
    public Integer getViewCount() { return viewCount; }
    public void setViewCount(Integer viewCount) { this.viewCount = viewCount; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public SellerDto getSeller() { return seller; }
    public void setSeller(SellerDto seller) { this.seller = seller; }
    public Double getAvgRating() { return avgRating; }
    public void setAvgRating(Double avgRating) { this.avgRating = avgRating; }
    public Long getReviewCount() { return reviewCount; }
    public void setReviewCount(Long reviewCount) { this.reviewCount = reviewCount; }

    public static class CategoryDto {
        private Long id;
        private String name;

        public CategoryDto() {}
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
    }

    public static class SellerDto {
        private Long id;
        private String fullName;
        private String avatarUrl;

        public SellerDto() {}
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public String getAvatarUrl() { return avatarUrl; }
        public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
    }
}