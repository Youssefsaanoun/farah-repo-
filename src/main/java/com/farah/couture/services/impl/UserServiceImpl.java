package com.farah.couture.services.impl;

import com.farah.couture.entities.Cart;
import com.farah.couture.entities.User;
import com.farah.couture.repositories.CartRepository;
import com.farah.couture.repositories.UserRepository;
import com.farah.couture.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.SimpleMailMessage;

import java.util.Optional;
import org.springframework.security.crypto.password.PasswordEncoder;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private PasswordEncoder encoder;

    @Override
    public User registerUser(User user) {
        // Check if email already exists
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Cet email est déjà utilisé !");
        }

        // Simple registration logic
        user.setPassword(encoder.encode(user.getPassword()));
        user.setRole("CLIENT"); // Default role
        User savedUser = userRepository.save(user);

        // Create a cart for the new user
        Cart cart = new Cart();
        cart.setUser(savedUser);
        cartRepository.save(cart);

        return savedUser;
    }

    @Override
    public java.util.List<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Override
    public User getUserById(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    @Override
    public User updateUser(Long id, User userDetails) {
        Optional<User> optionalUser = userRepository.findById(id);
        if (optionalUser.isPresent()) {
            User existingUser = optionalUser.get();
            if (userDetails.getFirstName() != null)
                existingUser.setFirstName(userDetails.getFirstName());
            if (userDetails.getLastName() != null)
                existingUser.setLastName(userDetails.getLastName());
            if (userDetails.getEmail() != null)
                existingUser.setEmail(userDetails.getEmail());
            if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
                if (userDetails.getOldPassword() == null
                        || !encoder.matches(userDetails.getOldPassword(), existingUser.getPassword())) {
                    throw new RuntimeException("Ancien mot de passe incorrect");
                }
                existingUser.setPassword(encoder.encode(userDetails.getPassword()));
            }
            return userRepository.save(existingUser);
        }
        return null;
    }

    @Override
    public void requestPasswordReset(String email) {
        java.util.List<User> users = userRepository.findByEmail(email);
        if (!users.isEmpty()) {
            // Pick the first user
            User user = users.get(0);
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                // Ensure this matches the username in application.properties or use a
                // configured property
                message.setFrom("YOUR_EMAIL@gmail.com");
                message.setTo(email);
                message.setSubject("Farah Couture - Password Reset");
                message.setText(
                        "Click the link to reset your password: http://localhost:4200/reset-password?email=" + email);

                mailSender.send(message);
                System.out.println("Email sent to " + email);
            } catch (Exception e) {
                System.err.println("Failed to send email: " + e.getMessage());
            }
        } else {
            System.out.println("Password reset requested for non-existent email: " + email);
        }
    }

    @Override
    public void resetPassword(String email, String newPassword) {
        java.util.List<User> users = userRepository.findByEmail(email);
        if (!users.isEmpty()) {
            User user = users.get(0);
            user.setPassword(encoder.encode(newPassword));
            userRepository.save(user);
        }
    }

    @Override
    public java.util.List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    @Override
    public User blockUser(Long id) {
        Optional<User> user = userRepository.findById(id);
        if (user.isPresent()) {
            User u = user.get();
            u.setBlocked(true);
            return userRepository.save(u);
        }
        return null;
    }

    @Override
    public User unblockUser(Long id) {
        Optional<User> user = userRepository.findById(id);
        if (user.isPresent()) {
            User u = user.get();
            u.setBlocked(false);
            return userRepository.save(u);
        }
        return null;
    }

    @Override
    public User updateUserByAdmin(Long id, User userDetails) {
        Optional<User> optionalUser = userRepository.findById(id);
        if (optionalUser.isPresent()) {
            User existingUser = optionalUser.get();
            if (userDetails.getFirstName() != null)
                existingUser.setFirstName(userDetails.getFirstName());
            if (userDetails.getLastName() != null)
                existingUser.setLastName(userDetails.getLastName());
            if (userDetails.getEmail() != null)
                existingUser.setEmail(userDetails.getEmail());
            // Admin can update password without old password
            if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
                existingUser.setPassword(encoder.encode(userDetails.getPassword()));
            }
            if (userDetails.getRole() != null) {
                existingUser.setRole(userDetails.getRole());
            }
            return userRepository.save(existingUser);
        }
        return null;
    }
}
