package com.kaiju.store.service;

import com.kaiju.store.dto.PaginationDto;
import com.kaiju.store.dto.UserDto;
import com.kaiju.store.enums.Role;
import com.kaiju.store.model.User;
import com.kaiju.store.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

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
}
