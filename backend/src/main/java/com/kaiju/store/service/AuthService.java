package com.kaiju.store.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.kaiju.store.model.User;
import com.kaiju.store.repository.UserRepository;
import com.kaiju.store.util.JwtUtil;

import org.springframework.security.crypto.password.PasswordEncoder;
import com.kaiju.store.enums.Role;

import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    public User register(String email, String password, String fullName, String phoneNumber, String roleStr,
            String avatarUrl) {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Email đã được sử dụng!");
        }

        User newUser = new User();
        newUser.setEmail(email);
        newUser.setFullName(fullName);
        newUser.setPhoneNumber(phoneNumber);
        newUser.setAvatarUrl(avatarUrl);
        try {
            newUser.setRole(Role.valueOf(roleStr.toUpperCase()));
        } catch (Exception e) {
            newUser.setRole(Role.BUYER);
        }
        newUser.setPassword(passwordEncoder.encode(password));
        return userRepository.save(newUser);
    }

    public User login(String email, String password) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent() && passwordEncoder.matches(password, userOpt.get().getPassword())) {
            return userOpt.get();
        }
        throw new RuntimeException("Sai tài khoản hoặc mật khẩu!");
    }

    public String generateToken(User user) {
        return jwtUtil.generateToken(user.getEmail(), user.getRole().name(), user.getId());
    }

    public void verifyEmail(String token) {
        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> new RuntimeException("Token xác minh không hợp lệ."));
        user.setVerificationToken(null);
        userRepository.save(user);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
}
