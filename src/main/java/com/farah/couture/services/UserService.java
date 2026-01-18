package com.farah.couture.services;

import com.farah.couture.entities.User;
import java.util.List;
import java.util.Optional;

public interface UserService {
    User registerUser(User user);

    List<User> findByEmail(String email);

    User getUserById(Long id);

    User updateUser(Long id, User user);

    void requestPasswordReset(String email);

    void resetPassword(String email, String newPassword);

    java.util.List<User> getAllUsers();

    void deleteUser(Long id);

    User blockUser(Long id);

    User unblockUser(Long id);

    User updateUserByAdmin(Long id, User user);
}
