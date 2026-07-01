package com.kaiju.store.controller;

import com.kaiju.store.dto.UserDto;
import com.kaiju.store.model.User;
import com.kaiju.store.repository.ApiResponse;
import com.kaiju.store.service.UserService;
import com.kaiju.store.util.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private UserService userService;
    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    // Danh sách hoạ sĩ (SELLER) cho form đặt đơn vẽ theo yêu cầu
    @GetMapping("/artists")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getArtists() {
        return ResponseEntity.ok(new ApiResponse<>("success", null, userService.getArtists()));
    }

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