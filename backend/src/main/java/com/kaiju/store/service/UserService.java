package com.kaiju.store.service;

import com.kaiju.store.model.User;
import com.kaiju.store.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public Map<String, Object> updateProfile(User currentUser, Map<String, String> request) {
        if (request.containsKey("fullName")) {
            currentUser.setFullName(request.get("fullName"));
        }
        if (request.containsKey("phoneNumber")) {
            currentUser.setPhoneNumber(request.get("phoneNumber"));
        }
        if (request.containsKey("avatarUrl")) {
            currentUser.setAvatarUrl(request.get("avatarUrl"));
        }
        if (request.containsKey("address")) {
            currentUser.setAddress(request.get("address"));
        }

        User updatedUser = userRepository.save(currentUser);

        Map<String, Object> data = new HashMap<>();
        data.put("id", updatedUser.getId());
        data.put("email", updatedUser.getEmail());
        data.put("fullName", updatedUser.getFullName());
        data.put("phoneNumber", updatedUser.getPhoneNumber());
        data.put("avatarUrl", updatedUser.getAvatarUrl());
        data.put("address", updatedUser.getAddress());
        return data;
    }
}