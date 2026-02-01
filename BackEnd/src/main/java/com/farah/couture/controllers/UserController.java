package com.farah.couture.controllers;

import com.farah.couture.entities.User;
import com.farah.couture.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import com.farah.couture.payload.request.LoginRequest;
import com.farah.couture.payload.response.JwtResponse;
import com.farah.couture.security.jwt.JwtUtils;
import com.farah.couture.security.services.UserDetailsImpl;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(UserController.class);

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        logger.info("Received registration request for email: {}", user.getEmail());
        try {
            User registeredUser = userService.registerUser(user);
            logger.info("User registered successfully: {}", user.getEmail());
            return ResponseEntity.ok(registeredUser);
        } catch (RuntimeException e) {
            logger.error("Error registering user: {}", e.getMessage());
            return ResponseEntity.badRequest().body(java.util.Collections.singletonMap("message", e.getMessage()));
        }
    }

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtils jwtUtils;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        return ResponseEntity.ok(new JwtResponse(jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getFirstName(),
                userDetails.getLastName(),
                roles.get(0))); // Sending single role as string for simplicity as per existing User entity
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User user) {
        // This endpoint is used by users to update their OWN profile (requires old
        // password check logic in service)
        try {
            User updatedUser = userService.updateUser(id, user); // UserServiceImpl has the check
            return ResponseEntity.ok(updatedUser);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Collections.singletonMap("message", e.getMessage()));
        }
    }

    @PutMapping("/admin/{id}")
    public ResponseEntity<?> updateUserByAdmin(@PathVariable Long id, @RequestBody User user) {
        // This endpoint is used by ADMINs to update ANY profile (bypasses old password
        // check)
        try {
            return ResponseEntity.ok(userService.updateUserByAdmin(id, user));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Collections.singletonMap("message", e.getMessage()));
        }
    }

    @PostMapping("/forgot-password")
    public void forgotPassword(@RequestBody java.util.Map<String, String> request) {
        String email = request.get("email");
        userService.requestPasswordReset(email);
    }

    @PostMapping("/reset-password")
    public void resetPassword(@RequestBody java.util.Map<String, String> request) {
        String email = request.get("email");
        String newPassword = request.get("newPassword");
        userService.resetPassword(email, newPassword);
    }

    @GetMapping("/all")
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
    }

    @PutMapping("/{id}/block")
    public User blockUser(@PathVariable Long id) {
        return userService.blockUser(id);
    }

    @PutMapping("/{id}/unblock")
    public User unblockUser(@PathVariable Long id) {
        return userService.unblockUser(id);
    }
}
