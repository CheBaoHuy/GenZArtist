package com.kaiju.store.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.kaiju.store.service.AuthService;
import com.kaiju.store.repository.RegisterRequest;
import com.kaiju.store.repository.LoginRequest;
import com.kaiju.store.repository.ApiResponse;
import com.kaiju.store.dto.ForgotPasswordRequest;
import com.kaiju.store.dto.ResetPasswordRequest;

import com.kaiju.store.dto.UserDto;
import com.kaiju.store.model.User;

import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Void>> register(@RequestBody RegisterRequest request) {
        authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponse<>("success",
                "Đăng ký thành công. Vui lòng kiểm tra email để xác minh tài khoản.", null));
    }

    // @PostMapping("/verify-email")
    // public ResponseEntity<ApiResponse<Void>> verifyEmail(@RequestBody Map<String, String> request) {
    //     authService.verifyEmail(request.get("token"));
    //     return ResponseEntity.ok(new ApiResponse<>("success", "Tài khoản của bạn đã được xác minh thành công. Bạn hiện tại đã có thể đăng nhập.", null));
    // }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<Map<String, Object>>> login(@RequestBody LoginRequest request) {
        User user = authService.login(request.getEmail(), request.getPassword());
        String token = authService.generateToken(user);
        Map<String, Object> data = new HashMap<>();
        data.put("accessToken", token);
        data.put("tokenType", "Bearer");
        data.put("expiresIn", 86400);
        data.put("user", UserDto.summary(user));
        return ResponseEntity.ok(new ApiResponse<>("success", "Đăng nhập thành công.", data));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(@RequestHeader(value = "Authorization", required = false) String authorization) {
        if (authorization != null && authorization.startsWith("Bearer ")) {
            String token = authorization.substring(7);
            authService.logout(token);
        }
        return ResponseEntity.ok(new ApiResponse<>("success", "Đăng xuất thành công. Token đã bị vô hiệu hóa.", null));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        // Gọi sang service để tạo token reset
        authService.requestPasswordReset(request.getEmail());
        
        return ResponseEntity.ok(new ApiResponse<>("success", 
                "Yêu cầu thành công. Vui lòng kiểm tra email (hoặc console) để nhận mã khôi phục.", null));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@RequestBody ResetPasswordRequest request) {
        // Gọi sang service để cập nhật mật khẩu mới bằng token
        authService.resetPassword(request.getToken(), request.getNewPassword());
        
        return ResponseEntity.ok(new ApiResponse<>("success", 
                "Đặt lại mật khẩu thành công. Bạn có thể đăng nhập bằng mật khẩu mới.", null));
    }
}
