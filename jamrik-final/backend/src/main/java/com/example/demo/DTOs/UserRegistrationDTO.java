package com.example.demo.DTOs;

public record UserRegistrationDTO(
        String userName,
        String email,
        String role,
        String password,
        String confirmPassword,
        int avatar)
{}
