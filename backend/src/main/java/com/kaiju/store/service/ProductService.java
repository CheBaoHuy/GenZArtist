package com.kaiju.store.service;

import com.kaiju.store.dto.PaginationDto;
import com.kaiju.store.enums.ProductStatus;
import com.kaiju.store.model.Category;
import com.kaiju.store.model.Product;
import com.kaiju.store.model.User;
import com.kaiju.store.repository.CategoryRepository;
import com.kaiju.store.repository.ProductDetailResponse;
import com.kaiju.store.repository.ProductPublishRequest;
import com.kaiju.store.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    public Map<String, Object> listApprovedProducts(Long categoryId, int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(page - 1, 0), size);
        Page<Product> productPage;
        if (categoryId != null) {
            productPage = productRepository.findByStatusAndCategoryId(ProductStatus.APPROVED, categoryId, pageable);
        } else {
            productPage = productRepository.findByStatus(ProductStatus.APPROVED, pageable);
        }

        List<Map<String, Object>> products = productPage.getContent().stream()
                .map(this::toListItem)
                .collect(Collectors.toList());

        Map<String, Object> data = new HashMap<>();
        data.put("products", products);
        data.put("pagination", buildPagination(productPage, page));
        return data;
    }

    @Transactional
    public ProductDetailResponse getProductDetail(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));
        product.setViewCount(product.getViewCount() + 1);
        productRepository.save(product);
        return toDetailResponse(product);
    }

    public Map<String, Object> getSellerProducts(User seller, int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(page - 1, 0), size);
        Page<Product> productPage = productRepository.findBySellerId(seller.getId(), pageable);

        List<Map<String, Object>> products = productPage.getContent().stream()
                .map(this::toSellerItem)
                .collect(Collectors.toList());

        Map<String, Object> data = new HashMap<>();
        data.put("products", products);
        data.put("pagination", buildPagination(productPage, page));
        return data;
    }

    public Map<String, Object> publishProduct(User seller, ProductPublishRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Danh mục không tồn tại"));

        Product product = new Product();
        product.setName(request.getName());
        product.setCategory(category);
        product.setPrice(request.getPrice());
        product.setImageUrl(request.getImageUrl());
        product.setFileUrl(request.getFileUrl());
        product.setSeller(seller);
        product.setStatus(ProductStatus.PENDING);
        product = productRepository.save(product);

        Map<String, Object> data = toSellerItem(product);
        return data;
    }

    public Map<String, Object> getAdminProducts(String statusStr, int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(page - 1, 0), size);
        Page<Product> productPage;
        if (statusStr != null && !statusStr.isBlank()) {
            ProductStatus status = ProductStatus.valueOf(statusStr.toUpperCase());
            productPage = productRepository.findByStatus(status, pageable);
        } else {
            productPage = productRepository.findAll(pageable);
        }

        List<Map<String, Object>> products = productPage.getContent().stream()
                .map(this::toAdminItem)
                .collect(Collectors.toList());

        Map<String, Object> data = new HashMap<>();
        data.put("products", products);
        data.put("pagination", buildPagination(productPage, page));
        return data;
    }

    public void updateProductStatus(Long id, String statusStr) {
        Product product = findById(id);
        try {
            ProductStatus status = ProductStatus.valueOf(statusStr.toUpperCase());
            product.setStatus(status);
            productRepository.save(product);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Trạng thái sản phẩm không hợp lệ.");
        }
    }

    public Product findById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));
    }

    private Map<String, Object> toListItem(Product product) {
        Map<String, Object> item = new HashMap<>();
        item.put("id", product.getId());
        item.put("name", product.getName());
        item.put("price", product.getPrice());
        item.put("imageUrl", product.getImageUrl());
        item.put("viewCount", product.getViewCount());
        if (product.getCategory() != null) {
            Map<String, Object> cat = new HashMap<>();
            cat.put("id", product.getCategory().getId());
            cat.put("name", product.getCategory().getName());
            item.put("category", cat);
        }
        if (product.getSeller() != null) {
            Map<String, Object> seller = new HashMap<>();
            seller.put("id", product.getSeller().getId());
            seller.put("fullName", product.getSeller().getFullName());
            seller.put("avatarUrl", product.getSeller().getAvatarUrl());
            item.put("seller", seller);
        }
        return item;
    }

    private Map<String, Object> toSellerItem(Product product) {
        Map<String, Object> item = toListItem(product);
        item.put("fileUrl", product.getFileUrl());
        item.put("status", product.getStatus().name());
        item.put("createdAt", product.getCreatedAt());
        return item;
    }

    private Map<String, Object> toAdminItem(Product product) {
        Map<String, Object> item = new HashMap<>();
        item.put("id", product.getId());
        item.put("name", product.getName());
        item.put("price", product.getPrice());
        item.put("imageUrl", product.getImageUrl());
        item.put("status", product.getStatus().name());
        item.put("createdAt", product.getCreatedAt());
        if (product.getSeller() != null) {
            Map<String, Object> seller = new HashMap<>();
            seller.put("id", product.getSeller().getId());
            seller.put("fullName", product.getSeller().getFullName());
            item.put("seller", seller);
        }
        return item;
    }

    private ProductDetailResponse toDetailResponse(Product product) {
        ProductDetailResponse response = new ProductDetailResponse();
        response.setId(product.getId());
        response.setName(product.getName());
        response.setDescription(product.getDescription());
        response.setPrice(product.getPrice());
        response.setImageUrl(product.getImageUrl());
        response.setViewCount(product.getViewCount());
        response.setCreatedAt(product.getCreatedAt());
        if (product.getCategory() != null) {
            ProductDetailResponse.CategoryDto cat = new ProductDetailResponse.CategoryDto();
            cat.setId(product.getCategory().getId());
            cat.setName(product.getCategory().getName());
            response.setCategory(cat);
        }
        if (product.getSeller() != null) {
            ProductDetailResponse.SellerDto seller = new ProductDetailResponse.SellerDto();
            seller.setId(product.getSeller().getId());
            seller.setFullName(product.getSeller().getFullName());
            seller.setAvatarUrl(product.getSeller().getAvatarUrl());
            response.setSeller(seller);
        }
        return response;
    }

    private PaginationDto buildPagination(Page<?> page, int requestedPage) {
        return new PaginationDto(requestedPage, page.getTotalPages(), page.getTotalElements());
    }
}
