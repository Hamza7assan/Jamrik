package com.example.demo.repositories;
import com.example.demo.classes.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
@Repository
public interface JamrikRepository extends JpaRepository<User,Long> {
    @Query("SELECT u FROM User u WHERE u.userName = :username")
    Optional<User> findByUserName(@Param("username") String userName);
}
