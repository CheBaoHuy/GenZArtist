package com.kaiju.store.service;

import com.kaiju.store.model.Category;
import com.kaiju.store.repository.CategoryRepository;
import com.kaiju.store.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductRepository productRepository;

    public List<Category> getAll() {
        return categoryRepository.findAll();
    }

    public Category getById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục với ID: " + id));
    }

    @Transactional
    public Category create(Map<String, Object> request) {
        String name = asString(request.get("name"));
        if (name == null || name.isBlank()) {
            throw new RuntimeException("Tên danh mục không được để trống.");
        }
        if (categoryRepository.existsByName(name)) {
            throw new RuntimeException("Tên danh mục đã tồn tại.");
        }
        Category category = new Category();
        category.setName(name.trim());
        return categoryRepository.save(category);
    }

    @Transactional
    public Category update(Long id, Map<String, Object> request) {
        Category category = getById(id);
        String name = asString(request.get("name"));
        if (name != null && !name.isBlank() && !name.equals(category.getName())) {
            if (categoryRepository.existsByName(name)) {
                throw new RuntimeException("Tên danh mục đã tồn tại.");
            }
            category.setName(name.trim());
        }
        return categoryRepository.save(category);
    }

    @Transactional
    public void delete(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy danh mục với ID: " + id);
        }
        if (productRepository.existsByCategoryId(id)) {
            throw new RuntimeException("Không thể xóa danh mục đang có sản phẩm.");
        }
        categoryRepository.deleteById(id);
    }

    private String asString(Object value) {
        return value == null ? null : value.toString();
    }
}
