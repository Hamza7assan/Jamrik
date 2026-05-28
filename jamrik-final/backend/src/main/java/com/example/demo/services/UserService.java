package com.example.demo.services;
import com.example.demo.DTOs.PasswordDTO;
import com.example.demo.DTOs.UserChangeDataDTO;
import com.example.demo.DTOs.UserRegistrationDTO;
import com.example.demo.DTOs.UserResponseDTO;
import com.example.demo.repositories.JamrikRepository;
import com.example.demo.classes.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService implements UserDetailsService {
      //autowiring via constructor injection on the repo bean
      private final JamrikRepository jamrikRepo;
      //same with a bean from the encoder class, to hash user password
      private final BCryptPasswordEncoder hash;
    public UserService(JamrikRepository jamrikRepo,
                       BCryptPasswordEncoder hash){
        this.jamrikRepo=jamrikRepo;
        this.hash=hash;
    }
    public UserResponseDTO register(UserRegistrationDTO rdto){
     //check if the user is already in db
       if(jamrikRepo.findByUserName(rdto.userName()).isPresent()){
         throw new RuntimeException("Username already exists");
}
//create a new user
User user=new User();
//set the new user's attributes
user.setUserName(rdto.userName());
user.setEmail(rdto.email());
user.setRole(rdto.role());
//use encode() to hash the provided password before storing in the db
user.setPassword(hash.encode(rdto.password()));
//if new user, save info in db
     User savedUser= jamrikRepo.save(user);
     //using a dto to ensure hashed password isn't returned to frontend
     return new UserResponseDTO(
             savedUser.getId(),
             savedUser.getUserName(),
             savedUser.getEmail(),
             savedUser.getRole(),
             savedUser.getAvatar()
     );
}

    @Override
    public UserDetails loadUserByUsername(String userName) throws
            UsernameNotFoundException {
    //look up the user from the db using the unique username
        User user=jamrikRepo.findByUserName(userName)
                .orElseThrow(()->new UsernameNotFoundException(userName));
    //return user data and start the session
        return org.springframework.security.core.userdetails.User
                .withUsername(user.getUserName())
                .password(user.getPassword())
                .roles("USER")
                .build();
    }
    public UserResponseDTO changeData(String userName,UserChangeDataDTO cdto){
    //look up the user from the db using the unique username
        User user=jamrikRepo.findByUserName(userName)
                .orElseThrow(()->new RuntimeException("user not found"));
        //change old info using new info entered by the user
        user.setUserName(cdto.userName());
        user.setEmail(cdto.email());
        user.setRole(cdto.role());
        user.setAvatar(cdto.avatar());
        //save the new user data in the db
          User updatedUser=jamrikRepo.save(user);
          return new UserResponseDTO(
                  updatedUser.getId(),
                  updatedUser.getUserName(),
                  updatedUser.getEmail(),
                  updatedUser.getRole(),
                  updatedUser.getAvatar()
          );
}
    public void changePassword(String userName, PasswordDTO pDTO){
            //find the user in the db
            User user = jamrikRepo.findByUserName(userName)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            //compare current password to one in db
            if (!hash.matches(pDTO.currentPassword(), user.getPassword())) {
                throw new RuntimeException("Current password is incorrect");
            }
            //Hash and save the new password
            user.setPassword(hash.encode(pDTO.newPassword()));
            jamrikRepo.save(user);
    }
}



