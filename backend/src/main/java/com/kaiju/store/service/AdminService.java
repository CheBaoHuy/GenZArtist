package com.kaiju.store.service;

import com.kaiju.store.dto.PaginationDto;
import com.kaiju.store.dto.UserDto;
import com.kaiju.store.enums.Role;
import com.kaiju.store.enums.UserStatus;
import com.kaiju.store.model.User;
import com.kaiju.store.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public Map<String, Object> getUsers(String roleStr, int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(page - 1, 0), size);
        Page<User> userPage;
        if (roleStr != null && !roleStr.isBlank()) {
            Role role = Role.valueOf(roleStr.toUpperCase());
            userPage = userRepository.findByRole(role, pageable);
        } else {
            userPage = userRepository.findAll(pageable);
        }

        List<UserDto> users = userPage.getContent().stream()
                .map(UserDto::from)
                .collect(Collectors.toList());

        Map<String, Object> data = new HashMap<>();
        data.put("users", users);
        data.put("pagination", new PaginationDto(page, userPage.getTotalPages(), userPage.getTotalElements()));
        return data;
    }

    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với ID: " + id));
        return UserDto.from(user);
    }

    @Transactional
    public UserDto createUser(Map<String, Object> request) {
        String email = asString(request.get("email"));
        if (email == null || email.isBlank()) {
            throw new RuntimeException("Email không được để trống.");
        }
        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Email đã được sử dụng!");
        }
        String password = asString(request.get("password"));
        if (password == null || password.isBlank()) {
            throw new RuntimeException("Mật khẩu không được để trống.");
        }

        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setFullName(asString(request.getOrDefault("fullName", "")));
        user.setPhoneNumber(asString(request.get("phoneNumber")));
        user.setAvatarUrl(asString(request.get("avatarUrl")));
        user.setAddress(asString(request.get("address")));
        user.setRole(parseRole(request.get("role")));
        user.setStatus(parseStatus(request.get("status")));

        return UserDto.from(userRepository.save(user));
    }

    @Transactional
    public UserDto updateUser(Long id, Map<String, Object> request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với ID: " + id));

        if (request.containsKey("email")) {
            String email = asString(request.get("email"));
            if (email != null && !email.isBlank() && !email.equals(user.getEmail())) {
                if (userRepository.findByEmail(email).isPresent()) {
                    throw new RuntimeException("Email đã được sử dụng!");
                }
                user.setEmail(email);
            }
        }
        if (request.containsKey("fullName")) {
            user.setFullName(asString(request.get("fullName")));
        }
        if (request.containsKey("phoneNumber")) {
            user.setPhoneNumber(asString(request.get("phoneNumber")));
        }
        if (request.containsKey("avatarUrl")) {
            user.setAvatarUrl(asString(request.get("avatarUrl")));
        }
        if (request.containsKey("address")) {
            user.setAddress(asString(request.get("address")));
        }
        if (request.get("role") != null) {
            user.setRole(parseRole(request.get("role")));
        }

        if (request.get("status") != null) {
            user.setStatus(parseStatus(request.get("status")));
        }
        String password = asString(request.get("password"));
        if (password != null && !password.isBlank()) {
            user.setPassword(passwordEncoder.encode(password));
        }

        return UserDto.from(userRepository.save(user));
    }

    @Transactional
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy người dùng với ID: " + id);
        }
        userRepository.deleteById(id);
    }

    private String asString(Object value) {
        return value == null ? null : value.toString();
    }

    private Role parseRole(Object roleStr) {
    if (roleStr == null) {
        return Role.BUYER; // Giá trị mặc định nếu null
    }
    try {
        return Role.valueOf(roleStr.toString().trim().toUpperCase());
    } catch (IllegalArgumentException e) {
        return Role.BUYER; // Trả về mặc định nếu chuỗi truyền vào sai chính tả
    }
}
    private UserStatus parseStatus(Object value) {
        if (value == null) {
            return UserStatus.ACTIVE; // Giá trị mặc định nếu null
        }

        String status = value.toString()
            .trim()
            .toUpperCase()
            .replace("ROLE_", "");

        try {
        return UserStatus.valueOf(status);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Trạng thái không hợp lệ. Chỉ chấp nhận: ACTIVE, INACTIVE, BANNED");
        }
    }
}
