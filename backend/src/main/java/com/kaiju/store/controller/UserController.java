package com.kaiju.store.controller;

import com.kaiju.store.model.User;
import com.kaiju.store.repository.ApiResponse;
import com.kaiju.store.service.UserService;
import com.kaiju.store.util.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getProfile() {
        User currentUser = SecurityUtils.getCurrentUser();
        HashMap<String, Object> data = new HashMap<>();
        data.put("id", currentUser.getId());
        data.put("email", currentUser.getEmail());
        data.put("fullName", currentUser.getFullName());
        data.put("phoneNumber", currentUser.getPhoneNumber());
        data.put("avatarUrl", currentUser.getAvatarUrl());
        data.put("address", currentUser.getAddress());
        return ResponseEntity.ok(new ApiResponse<>("success", "Thông tin cá nhân của bạn.", data));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateProfile(
            @RequestBody Map<String, String> request) {
        User currentUser = SecurityUtils.getCurrentUser();
        // Chuyển logic xuống Service để update thông tin trong DB
        Map<String, Object> updatedUser = userService.updateProfile(currentUser, request);
        return ResponseEntity.ok(new ApiResponse<>("success", "Cập nhật thông tin cá nhân thành công.", updatedUser));
    }
}