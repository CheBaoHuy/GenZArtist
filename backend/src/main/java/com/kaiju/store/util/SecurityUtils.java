package com.kaiju.store.util;

import com.kaiju.store.enums.Role;
import com.kaiju.store.model.User;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class SecurityUtils {

    private SecurityUtils() {
    }

    public static User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof User user) {
            return user;
        }
        throw new RuntimeException("Bạn cần đăng nhập để thực hiện thao tác này.");
    }

    public static void requireRole(Role role) {
        User user = getCurrentUser();
        if (user.getRole() != role) {
            throw new RuntimeException("Bạn không có quyền truy cập tài nguyên này.");
        }
    }
}
