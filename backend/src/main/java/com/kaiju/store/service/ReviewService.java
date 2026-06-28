package com.kaiju.store.service;

import com.kaiju.store.dto.PaginationDto;
import com.kaiju.store.model.AuthorReview;
import com.kaiju.store.model.Product;
import com.kaiju.store.model.ProductReview;
import com.kaiju.store.model.User;
import com.kaiju.store.repository.AuthorReviewRepository;
import com.kaiju.store.repository.ProductRepository;
import com.kaiju.store.repository.ProductReviewRepository;
import com.kaiju.store.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    @Autowired
    private ProductReviewRepository productReviewRepository;

    @Autowired
    private AuthorReviewRepository authorReviewRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    // ===================== ĐÁNH GIÁ SẢN PHẨM =====================

    public Map<String, Object> getProductReviews(int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(page - 1, 0), size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<ProductReview> reviewPage = productReviewRepository.findAll(pageable);
        List<Map<String, Object>> reviews = reviewPage.getContent().stream()
                .map(this::toProductReviewItem)
                .collect(Collectors.toList());
        return buildListData(reviews, reviewPage, page);
    }

    public Map<String, Object> getProductReview(Long id) {
        return toProductReviewItem(findProductReview(id));
    }

    @Transactional
    public Map<String, Object> createProductReview(Map<String, Object> request) {
        Product product = productRepository.findById(parseId(request.get("productId"), "sản phẩm"))
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm."));
        User reviewer = userRepository.findById(parseId(request.get("reviewerId"), "người đánh giá"))
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người đánh giá."));

        ProductReview review = new ProductReview();
        review.setProduct(product);
        review.setReviewer(reviewer);
        review.setRating(parseRating(request.get("rating")));
        review.setComment(asString(request.get("comment")));
        return toProductReviewItem(productReviewRepository.save(review));
    }

    @Transactional
    public Map<String, Object> updateProductReview(Long id, Map<String, Object> request) {
        ProductReview review = findProductReview(id);
        if (request.get("productId") != null) {
            review.setProduct(productRepository.findById(parseId(request.get("productId"), "sản phẩm"))
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm.")));
        }
        if (request.get("reviewerId") != null) {
            review.setReviewer(userRepository.findById(parseId(request.get("reviewerId"), "người đánh giá"))
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy người đánh giá.")));
        }
        if (request.get("rating") != null) {
            review.setRating(parseRating(request.get("rating")));
        }
        if (request.containsKey("comment")) {
            review.setComment(asString(request.get("comment")));
        }
        return toProductReviewItem(productReviewRepository.save(review));
    }

    @Transactional
    public void deleteProductReview(Long id) {
        if (!productReviewRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy đánh giá sản phẩm.");
        }
        productReviewRepository.deleteById(id);
    }

    // ===================== ĐÁNH GIÁ TÁC GIẢ =====================

    public Map<String, Object> getAuthorReviews(int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(page - 1, 0), size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<AuthorReview> reviewPage = authorReviewRepository.findAll(pageable);
        List<Map<String, Object>> reviews = reviewPage.getContent().stream()
                .map(this::toAuthorReviewItem)
                .collect(Collectors.toList());
        return buildListData(reviews, reviewPage, page);
    }

    public Map<String, Object> getAuthorReview(Long id) {
        return toAuthorReviewItem(findAuthorReview(id));
    }

    @Transactional
    public Map<String, Object> createAuthorReview(Map<String, Object> request) {
        User author = userRepository.findById(parseId(request.get("authorId"), "tác giả"))
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tác giả."));
        User reviewer = userRepository.findById(parseId(request.get("reviewerId"), "người đánh giá"))
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người đánh giá."));

        AuthorReview review = new AuthorReview();
        review.setAuthor(author);
        review.setReviewer(reviewer);
        review.setRating(parseRating(request.get("rating")));
        review.setComment(asString(request.get("comment")));
        return toAuthorReviewItem(authorReviewRepository.save(review));
    }

    @Transactional
    public Map<String, Object> updateAuthorReview(Long id, Map<String, Object> request) {
        AuthorReview review = findAuthorReview(id);
        if (request.get("authorId") != null) {
            review.setAuthor(userRepository.findById(parseId(request.get("authorId"), "tác giả"))
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy tác giả.")));
        }
        if (request.get("reviewerId") != null) {
            review.setReviewer(userRepository.findById(parseId(request.get("reviewerId"), "người đánh giá"))
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy người đánh giá.")));
        }
        if (request.get("rating") != null) {
            review.setRating(parseRating(request.get("rating")));
        }
        if (request.containsKey("comment")) {
            review.setComment(asString(request.get("comment")));
        }
        return toAuthorReviewItem(authorReviewRepository.save(review));
    }

    @Transactional
    public void deleteAuthorReview(Long id) {
        if (!authorReviewRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy đánh giá tác giả.");
        }
        authorReviewRepository.deleteById(id);
    }

    // ===================== HELPERS =====================

    private ProductReview findProductReview(Long id) {
        return productReviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đánh giá sản phẩm."));
    }

    private AuthorReview findAuthorReview(Long id) {
        return authorReviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đánh giá tác giả."));
    }

    private Map<String, Object> buildListData(List<Map<String, Object>> reviews, Page<?> page, int requestedPage) {
        Map<String, Object> data = new HashMap<>();
        data.put("reviews", reviews);
        data.put("pagination", new PaginationDto(requestedPage, page.getTotalPages(), page.getTotalElements()));
        return data;
    }

    private Map<String, Object> toProductReviewItem(ProductReview review) {
        Map<String, Object> item = new HashMap<>();
        item.put("id", review.getId());
        item.put("rating", review.getRating());
        item.put("comment", review.getComment());
        item.put("createdAt", review.getCreatedAt());
        if (review.getProduct() != null) {
            item.put("productId", review.getProduct().getId());
            item.put("productName", review.getProduct().getName());
        }
        if (review.getReviewer() != null) {
            item.put("reviewerId", review.getReviewer().getId());
            item.put("reviewerName", review.getReviewer().getFullName());
        }
        return item;
    }

    private Map<String, Object> toAuthorReviewItem(AuthorReview review) {
        Map<String, Object> item = new HashMap<>();
        item.put("id", review.getId());
        item.put("rating", review.getRating());
        item.put("comment", review.getComment());
        item.put("createdAt", review.getCreatedAt());
        if (review.getAuthor() != null) {
            item.put("authorId", review.getAuthor().getId());
            item.put("authorName", review.getAuthor().getFullName());
        }
        if (review.getReviewer() != null) {
            item.put("reviewerId", review.getReviewer().getId());
            item.put("reviewerName", review.getReviewer().getFullName());
        }
        return item;
    }

    private String asString(Object value) {
        return value == null ? null : value.toString();
    }

    private Long parseId(Object value, String label) {
        if (value == null || value.toString().isBlank()) {
            throw new RuntimeException("Vui lòng chọn " + label + ".");
        }
        try {
            return Long.valueOf(value.toString().trim());
        } catch (NumberFormatException e) {
            throw new RuntimeException("ID " + label + " không hợp lệ.");
        }
    }

    private Integer parseRating(Object value) {
        if (value == null) {
            throw new RuntimeException("Vui lòng nhập số sao.");
        }
        int rating;
        try {
            rating = (int) Math.round(Double.parseDouble(value.toString().trim()));
        } catch (NumberFormatException e) {
            throw new RuntimeException("Số sao không hợp lệ.");
        }
        if (rating < 1 || rating > 5) {
            throw new RuntimeException("Số sao phải từ 1 đến 5.");
        }
        return rating;
    }
}
