package com.farah.couture.repositories;

import com.farah.couture.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    List<User> findByEmail(String email);

    boolean existsByEmail(String email);
}
