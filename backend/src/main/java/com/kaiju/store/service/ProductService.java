package com.kaiju.store.service;

import com.kaiju.store.dto.PaginationDto;
import com.kaiju.store.enums.ProductStatus;
import com.kaiju.store.model.Category;
import com.kaiju.store.model.Product;
import com.kaiju.store.model.User;
import com.kaiju.store.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
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

    @Autowired
    private ReviewRepository reviewRepository;

    public Map<String, Object> listApprovedProducts(Long categoryId, int page, int size, String sort) {
        Pageable pageable = PageRequest.of(Math.max(page - 1, 0), size, buildSort(sort));
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

    public Map<String, Object> listApprovedProducts(Long categoryId, int page, int size) {
        return listApprovedProducts(categoryId, page, size, "newest");
    }

    public Map<String, Object> getTrendingProducts(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        List<Product> trending = productRepository.findTrendingProducts(pageable);

        List<Map<String, Object>> products = trending.stream()
                .map(this::toListItem)
                .collect(Collectors.toList());

        Map<String, Object> data = new HashMap<>();
        data.put("products", products);
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

    private Sort buildSort(String sort) {
        return switch (sort == null ? "newest" : sort.toLowerCase()) {
            case "price_asc"  -> Sort.by(Sort.Direction.ASC,  "price");
            case "price_desc" -> Sort.by(Sort.Direction.DESC, "price");
            case "popular"    -> Sort.by(Sort.Direction.DESC, "viewCount");
            default           -> Sort.by(Sort.Direction.DESC, "createdAt"); // newest
        };
    // ===== Admin CRUD =====

    public Map<String, Object> getAdminProductDetail(Long id) {
        return toAdminDetail(findById(id));
    }

    @Transactional
    public Map<String, Object> createProduct(Map<String, Object> request) {
        String name = asString(request.get("name"));
        if (name == null || name.isBlank()) {
            throw new RuntimeException("Tên sản phẩm không được để trống.");
        }

        Product product = new Product();
        product.setName(name);
        product.setDescription(asString(request.get("description")));
        product.setPrice(parsePrice(request.get("price")));
        product.setImageUrl(asString(request.get("imageUrl")));
        product.setFileUrl(asString(request.get("fileUrl")));
        product.setCategory(resolveCategory(request.get("categoryId")));
        product.setStatus(parseStatus(request.get("status"), ProductStatus.APPROVED));

        return toAdminDetail(productRepository.save(product));
    }

    @Transactional
    public Map<String, Object> updateProduct(Long id, Map<String, Object> request) {
        Product product = findById(id);

        if (request.containsKey("name")) {
            product.setName(asString(request.get("name")));
        }
        if (request.containsKey("description")) {
            product.setDescription(asString(request.get("description")));
        }
        if (request.containsKey("price") && request.get("price") != null) {
            product.setPrice(parsePrice(request.get("price")));
        }
        if (request.containsKey("imageUrl")) {
            product.setImageUrl(asString(request.get("imageUrl")));
        }
        if (request.containsKey("fileUrl")) {
            product.setFileUrl(asString(request.get("fileUrl")));
        }
        if (request.get("categoryId") != null) {
            product.setCategory(resolveCategory(request.get("categoryId")));
        }
        if (request.get("status") != null) {
            product.setStatus(parseStatus(request.get("status"), product.getStatus()));
        }

        return toAdminDetail(productRepository.save(product));
    }

    @Transactional
    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy sản phẩm");
        }
        productRepository.deleteById(id);
    }

    private Map<String, Object> toAdminDetail(Product product) {
        Map<String, Object> item = new HashMap<>();
        item.put("id", product.getId());
        item.put("name", product.getName());
        item.put("description", product.getDescription());
        item.put("price", product.getPrice());
        item.put("imageUrl", product.getImageUrl());
        item.put("fileUrl", product.getFileUrl());
        item.put("viewCount", product.getViewCount());
        item.put("status", product.getStatus() != null ? product.getStatus().name() : null);
        item.put("createdAt", product.getCreatedAt());
        if (product.getCategory() != null) {
            Map<String, Object> cat = new HashMap<>();
            cat.put("id", product.getCategory().getId());
            cat.put("name", product.getCategory().getName());
            item.put("category", cat);
            item.put("categoryId", product.getCategory().getId());
        }
        if (product.getSeller() != null) {
            Map<String, Object> seller = new HashMap<>();
            seller.put("id", product.getSeller().getId());
            seller.put("fullName", product.getSeller().getFullName());
            item.put("seller", seller);
        }
        return item;
    }

    private Category resolveCategory(Object categoryId) {
        if (categoryId == null || categoryId.toString().isBlank()) {
            return null;
        }
        Long id;
        try {
            id = Long.valueOf(categoryId.toString().trim());
        } catch (NumberFormatException e) {
            throw new RuntimeException("Danh mục không hợp lệ.");
        }
        return categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Danh mục không tồn tại"));
    }

    private String asString(Object value) {
        return value == null ? null : value.toString();
    }

    private BigDecimal parsePrice(Object value) {
        if (value == null || value.toString().isBlank()) {
            return BigDecimal.ZERO;
        }
        try {
            return new BigDecimal(value.toString().trim());
        } catch (NumberFormatException e) {
            throw new RuntimeException("Giá sản phẩm không hợp lệ.");
        }
    }

    private ProductStatus parseStatus(Object value, ProductStatus fallback) {
        if (value == null || value.toString().isBlank()) {
            return fallback;
        }
        try {
            return ProductStatus.valueOf(value.toString().trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Trạng thái sản phẩm không hợp lệ.");
        }
    }

    private Map<String, Object> toListItem(Product product) {
        Map<String, Object> item = new HashMap<>();
        item.put("id", product.getId());
        item.put("name", product.getName());
        item.put("price", product.getPrice());
        item.put("imageUrl", product.getImageUrl());
        item.put("viewCount", product.getViewCount());
        item.put("createdAt", product.getCreatedAt());

        Double avgRating = reviewRepository.avgRatingByProduct(product.getId());
        Long reviewCount = reviewRepository.countByProduct(product.getId());
        item.put("avgRating", avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0.0);
        item.put("reviewCount", reviewCount);

        if (product.getCategory() != null) {
            item.put("category", Map.of(
                    "id", product.getCategory().getId(),
                    "name", product.getCategory().getName()
            ));
        }
        if (product.getSeller() != null) {
            item.put("seller", Map.of(
                    "id", product.getSeller().getId(),
                    "fullName", product.getSeller().getFullName(),
                    "avatarUrl", product.getSeller().getAvatarUrl() != null
                            ? product.getSeller().getAvatarUrl() : ""
            ));
        }
        return item;
    }

    private Map<String, Object> toSellerItem(Product product) {
        Map<String, Object> item = toListItem(product);
        item.put("fileUrl", product.getFileUrl());
        item.put("status", product.getStatus().name());
//        item.put("createdAt", product.getCreatedAt());
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
            item.put("seller", Map.of(
                    "id", product.getSeller().getId(),
                    "fullName", product.getSeller().getFullName()
            ));
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

        Double avgRating = reviewRepository.avgRatingByProduct(product.getId());
        Long reviewCount = reviewRepository.countByProduct(product.getId());
        response.setAvgRating(avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0.0);
        response.setReviewCount(reviewCount);

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
