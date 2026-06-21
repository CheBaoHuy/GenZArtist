package com.kaiju.store.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kaiju.store.enums.Role;
import com.kaiju.store.enums.UserStatus;
import com.kaiju.store.model.User;
import com.kaiju.store.repository.ProductRepository;
import com.kaiju.store.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class AuthProfileIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        productRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void registerCreatesUserWithVerificationToken() throws Exception {
        Map<String, Object> payload = new HashMap<>();
        payload.put("email", "test@example.com");
        payload.put("password", "Password123!");
        payload.put("fullName", "Nguyễn Văn Test");
        payload.put("phoneNumber", "0901234567");
        payload.put("role", "BUYER");
        payload.put("avatarUrl", "https://example.com/avatar.png");

        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("success"));

        User saved = userRepository.findByEmail("test@example.com").orElseThrow();
        assertThat(saved.getVerificationToken()).isNotBlank();
    }

    @Test
    void verifyEmailRemovesVerificationToken() throws Exception {
        User user = createVerifiedUser("verify@example.com", "Password123!");
        user.setVerificationToken("verify-token-123");
        userRepository.save(user);

        Map<String, String> body = Map.of("token", "verify-token-123");

        mockMvc.perform(post("/api/v1/auth/verify-email")
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("success"));

        User updated = userRepository.findByEmail("verify@example.com").orElseThrow();
        assertThat(updated.getVerificationToken()).isNull();
    }

    @Test
    void loginReturnsJwtForVerifiedUser() throws Exception {
        User user = createVerifiedUser("login@example.com", "Password123!");

        Map<String, String> body = new HashMap<>();
        body.put("email", user.getEmail());
        body.put("password", "Password123!");

        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.data.user.email").value(user.getEmail()));
    }

    @Test
    void forgotPasswordGeneratesResetToken() throws Exception {
        User user = createVerifiedUser("forgot@example.com", "Password123!");

        Map<String, String> body = Map.of("email", user.getEmail());

        mockMvc.perform(post("/api/v1/auth/forgot-password")
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("success"));

        User updated = userRepository.findByEmail("forgot@example.com").orElseThrow();
        assertThat(updated.getPasswordResetToken()).isNotBlank();
    }

    @Test
    void resetPasswordChangesPassword() throws Exception {
        User user = createVerifiedUser("reset@example.com", "OldPassword123!");
        user.setPasswordResetToken("reset-token-123");
        userRepository.save(user);

        Map<String, String> body = new HashMap<>();
        body.put("token", "reset-token-123");
        body.put("newPassword", "NewPassword456!");

        mockMvc.perform(post("/api/v1/auth/reset-password")
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("success"));

        User updated = userRepository.findByEmail("reset@example.com").orElseThrow();
        assertThat(passwordEncoder.matches("NewPassword456!", updated.getPassword())).isTrue();
        assertThat(updated.getPasswordResetToken()).isNull();
    }

    @Test
    void updateProfileReturnsUpdatedUser() throws Exception {
        User user = createVerifiedUser("profile@example.com", "Password123!");

        Map<String, Object> body = new HashMap<>();
        body.put("fullName", "Người Dùng Mới");
        body.put("phoneNumber", "0912345678");
        body.put("avatarUrl", "https://example.com/new-avatar.png");
        body.put("address", "123 Đường Sáng Tạo");

        String token = loginAndGetToken(user.getEmail(), "Password123!");

        mockMvc.perform(put("/api/v1/users/profile")
                .header("Authorization", "Bearer " + token)
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.fullName").value("Người Dùng Mới"))
                .andExpect(jsonPath("$.data.phoneNumber").value("0912345678"))
                .andExpect(jsonPath("$.data.address").value("123 Đường Sáng Tạo"));
    }

    @Test
    void logoutBlacklistsToken() throws Exception {
        User user = createVerifiedUser("logout@example.com", "Password123!");
        String token = loginAndGetToken(user.getEmail(), "Password123!");

        mockMvc.perform(post("/api/v1/auth/logout")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("success"));

        Map<String, Object> body = Map.of("fullName", "Không Đổi");
        mockMvc.perform(put("/api/v1/users/profile")
                .header("Authorization", "Bearer " + token)
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isForbidden());
    }

    private User createVerifiedUser(String email, String rawPassword) {
        User user = new User();
        user.setEmail(email);
        user.setFullName("Test User");
        user.setPhoneNumber("0900000000");
        user.setRole(Role.BUYER);
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setAvatarUrl("https://example.com/avatar.png");
        user.setStatus(UserStatus.ACTIVE);
        user.setVerificationToken(null);
        return userRepository.save(user);
    }

    private String loginAndGetToken(String email, String password) throws Exception {
        Map<String, String> body = Map.of("email", email, "password", password);
        String response = mockMvc.perform(post("/api/v1/auth/login")
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        return objectMapper.readTree(response).path("data").path("accessToken").asText();
    }
}