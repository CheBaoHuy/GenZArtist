package com.kaiju.gamewiki.service;

import com.kaiju.gamewiki.model.User;
import com.kaiju.gamewiki.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

import java.security.Key;
import java.util.Date;
import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    public PasswordEncoder passwordEncoder;

    public User register(String username, String password) {
        // 1. Kiểm tra xem user đã tồn tại chưa (tùy chọn nhưng nên có)
        if (userRepository.findByUsername(username).isPresent()) {
            throw new RuntimeException("User đã tồn tại!");
        }

        // 2. TẠO ĐỐI TƯỢNG USER MỚI
        User newUser = new User();
        newUser.setUsername(username);

        // CHỖ QUAN TRỌNG NHẤT ĐÂY:
        // Thay vì lưu trực tiếp 'password' thuần, ta lưu bản đã được mã hóa
        String encodedPassword = passwordEncoder.encode(password);
        newUser.setPassword(encodedPassword);

        // 3. LƯU VÀO DATABASE
        return userRepository.save(newUser);
    }

    public String login(String username, String password) {
        // 1. Tìm user trong DB
        Optional<User> userOpt = userRepository.findByUsername(username);

        // 2. Kiểm tra: User có tồn tại không? Mật khẩu khớp (BCrypt) không?
        if (userOpt.isPresent() && passwordEncoder.matches(password, userOpt.get().getPassword())) {

            // 3. Nếu đúng, tiến hành "đúc" Token JWT
            return Jwts.builder()
                    .setSubject(username)
                    .setIssuedAt(new Date(System.currentTimeMillis()))
                    .setExpiration(new Date(System.currentTimeMillis() + 86400000)) // Hết hạn sau 1 ngày
                    .signWith(getSigningKey(), SignatureAlgorithm.HS256) // Dùng Key object thay vì String
                    .compact();
        }

        // 4. Nếu sai, quăng lỗi (Spring Security sẽ chuyển thành 401 Unauthorized)
        throw new RuntimeException("Sai tài khoản hoặc mật khẩu!");
    }

    private Key getSigningKey() {
        // Chuỗi bí mật này phải dài ít nhất 32 ký tự (256-bit) để đảm bảo an toàn cho
        // thuật toán HS256
        String secret = "Bi-Mat-Cua-Kaiju-Game-Wiki-2026-Sieu-Cap-Vip-Pro";

        // Chuyển chuỗi String thành một đối tượng Key mà thư viện JJWT có thể hiểu được
        byte[] keyBytes = secret.getBytes();
        return Keys.hmacShaKeyFor(keyBytes);
    }
}