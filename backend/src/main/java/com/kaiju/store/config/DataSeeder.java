package com.kaiju.store.config;
import java.text.Normalizer;


import com.kaiju.store.enums.ProductStatus;
import com.kaiju.store.enums.Role;
import com.kaiju.store.model.Category;
import com.kaiju.store.model.Product;
import com.kaiju.store.model.User;
import com.kaiju.store.repository.CategoryRepository;
import com.kaiju.store.repository.ProductRepository;
import com.kaiju.store.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (categoryRepository.count() == 0) {
            seedCategories();
        }
        if (userRepository.count() <= 2) {
            seedUsers();
        }
        if (productRepository.count() == 0) {
            seedProducts();
        }
    }

    private void seedCategories() {
        String[] names = {
                "Sơn dầu", "Màu nước", "Tranh chì", "Tranh kỹ thuật số",
                "Anime Style", "Chibi", "3D Model", "Background", "Live2D"
        };

        for (String name : names) {
            Category cat = new Category();
            cat.setName(name);
            cat.setSlug(toSlug(name)); // thêm dòng này
            categoryRepository.save(cat);
        }
    }
    
    private String toSlug(String input) {
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);

        return normalized
                .replaceAll("\\p{M}", "")
                .replace("đ", "d")
                .replace("Đ", "D")
                .toLowerCase()
                .trim()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-");
    }


    private void seedUsers() {
        if (userRepository.findByEmail("admin@pixelhub.com").isEmpty()) {
            User admin = new User();
            admin.setEmail("admin@pixelhub.com");
            admin.setPassword(passwordEncoder.encode("Admin123!"));
            admin.setFullName("Quản Trị Viên");
            admin.setPhoneNumber("0900000000");
            admin.setRole(Role.ADMIN);
            admin.setAvatarUrl("https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100");
            userRepository.save(admin);
        }

        if (userRepository.findByEmail("seller@pixelhub.com").isEmpty()) {
            User seller = new User();
            seller.setEmail("seller@pixelhub.com");
            seller.setPassword(passwordEncoder.encode("Seller123!"));
            seller.setFullName("Nguyễn Văn Nghệ Thuật");
            seller.setPhoneNumber("0901234567");
            seller.setRole(Role.SELLER);
            seller.setAvatarUrl("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100");
            userRepository.save(seller);
        }

        if (userRepository.findByEmail("buyer@pixelhub.com").isEmpty()) {
            User buyer = new User();
            buyer.setEmail("buyer@pixelhub.com");
            buyer.setPassword(passwordEncoder.encode("Buyer123!"));
            buyer.setFullName("Trần Văn Mua Tranh");
            buyer.setPhoneNumber("0987654321");
            buyer.setRole(Role.BUYER);
            buyer.setAvatarUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100");
            userRepository.save(buyer);
        }
    }

    private void seedProducts() {
        User seller = userRepository.findByEmail("seller@pixelhub.com").orElse(null);
        if (seller == null) return;

        Category sonDau = categoryRepository.findAll().stream()
                .filter(c -> c.getName().equals("Sơn dầu")).findFirst().orElse(categoryRepository.findAll().get(0));
        Category anime = categoryRepository.findAll().stream()
                .filter(c -> c.getName().equals("Anime Style")).findFirst().orElse(sonDau);
        Category chibi = categoryRepository.findAll().stream()
                .filter(c -> c.getName().equals("Chibi")).findFirst().orElse(sonDau);
        Category bg = categoryRepository.findAll().stream()
                .filter(c -> c.getName().equals("Background")).findFirst().orElse(sonDau);

        createProduct(seller, sonDau, "Tranh Sơn Dầu Mùa Thu",
                "Bức tranh vẽ phong cảnh mùa thu lãng mạn bằng chất liệu sơn dầu cao cấp.",
                new BigDecimal("1200000"),
                "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600",
                "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1200");

        createProduct(seller, chibi, "Mô hình nhân vật 3D Chibi - Có Rigging đầy đủ",
                "Mô hình 3D chibi chất lượng cao với rigging hoàn chỉnh.",
                new BigDecimal("3000000"),
                "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600",
                "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200");

        createProduct(seller, anime, "Vẽ Character Design theo phong cách Anime 2D",
                "Thiết kế nhân vật anime 2D chuẩn Nhật Bản.",
                new BigDecimal("800000"),
                "https://images.unsplash.com/photo-1547891654-e966ed006aa5?w=600",
                "https://images.unsplash.com/photo-1547891654-e966ed006aa5?w=1200");

        createProduct(seller, bg, "Vẽ Background/Phong cảnh phong cách Ghibli",
                "Background phong cảnh thơ mộng phong cách Studio Ghibli.",
                new BigDecimal("1500000"),
                "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600",
                "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200");
    }

    private void createProduct(User seller, Category category, String name, String desc,
            BigDecimal price, String imageUrl, String fileUrl) {
        Product product = new Product();
        product.setName(name);
        product.setDescription(desc);
        product.setCategory(category);
        product.setPrice(price);
        product.setImageUrl(imageUrl);
        product.setFileUrl(fileUrl);
        product.setSeller(seller);
        product.setStatus(ProductStatus.APPROVED);
        product.setViewCount((int) (Math.random() * 200) + 50);
        productRepository.save(product);
    }
}
