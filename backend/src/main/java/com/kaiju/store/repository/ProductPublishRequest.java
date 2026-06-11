package com.kaiju.store.repository;

import java.math.BigDecimal;

public class ProductPublishRequest {
    private String name;
    private Long categoryId;
    private BigDecimal price;
    private String imageUrl;
    private String fileUrl;

    public ProductPublishRequest() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }
}