package com.example.demo.controllers;

import com.example.demo.DTOs.*;
import com.example.demo.services.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/jamrik")
public class UserController {
     private final UserService userService;
     public UserController(UserService userService){
         this.userService = userService;}

    //pass userRegisterDTO to service
    @PostMapping("/register")
    public UserResponseDTO
    register(@RequestBody UserRegistrationDTO user){
        return userService.register(user);
    }
    //is username a path variable annotation? CHECK IT
    @PutMapping("/changeData/{userName}")
    public UserResponseDTO changeUserData(@PathVariable String userName,
                                          @RequestBody UserChangeDataDTO cdto){
         return userService.changeData(userName,cdto);

    }
    @PutMapping("/changePassword/{userName}")
    public ResponseEntity<?> changePassword(@PathVariable String userName,
                                          @RequestBody PasswordDTO pDTO){
        userService.changePassword(userName,pDTO);
        return ResponseEntity.ok("Password updated successfully");
    }

}
