package com.kaiju.gamewiki.repository;

import lombok.Data;

@Data
public class AuthRequest {
    private String username;
    private String password;
}