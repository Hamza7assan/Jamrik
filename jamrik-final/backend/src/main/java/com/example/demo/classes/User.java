package com.example.demo.classes;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
//used to remove getter/setter boilerplate
@Data
//for database
@Entity
@Table(name="USERS", indexes = {@Index(name = "idx_user_name", columnList = "userName")})
//to create a default constructor(no boilerplate again)
@NoArgsConstructor
public class User {
    //it is the id in the db table
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable=false,unique=true)
    private String userName;
    @Column(nullable=false,unique=true)
    private String email;
    @Column(nullable=false)
    private String password;
    private String role;
    private int avatar;

    public User( String UserName, String Email, String Password, String Role){
         userName=UserName;
         email=Email;
         password=Password;
         role=Role;

    }









}
