// src/main/java/com/geopledge/auth/service/AuthServiceImpl.java
package com.geopledge.auth.service;

import com.geopledge.auth.AuthService;
import com.geopledge.auth.dto.LoginRequest;
import com.geopledge.auth.dto.SignupRequest;
import com.geopledge.auth.dto.JwtResponse;
import com.geopledge.auth.dto.MessageResponse;
import com.geopledge.auth.model.User;
import com.geopledge.auth.repository.UserRepository;
import com.geopledge.auth.security.JwtUtils;
import com.geopledge.exception.UserNotFoundException;
import com.geopledge.exception.InvalidPasswordException;
import com.geopledge.exception.EmailAlreadyExistsException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    @Autowired
    public AuthServiceImpl(UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           JwtUtils jwtUtils) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
    }

    /**
     * Register a new user. Throws RuntimeException if email is taken.
     */
    @Override
    @Transactional
    public MessageResponse registerUser(SignupRequest signupRequest) throws EmailAlreadyExistsException {
        String email = signupRequest.getEmail().toLowerCase().trim();
        if (userRepository.existsByEmail(email)) {
            throw new EmailAlreadyExistsException();
        }

        // Create new user's account
        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(signupRequest.getPassword()));
        userRepository.save(user);

        return new MessageResponse("User registered successfully!");
    }

    /**
     * Authenticate user credentials; if valid, return a JWT. Otherwise throw RuntimeException.
     */
    @Override
    @Transactional(readOnly = true)
    public JwtResponse authenticateUser(LoginRequest loginRequest) throws UserNotFoundException, InvalidPasswordException {
        String email = loginRequest.getEmail().toLowerCase().trim();
        String rawPassword = loginRequest.getPassword();

        // Lookup user by email
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException(email));

        // Verify password
        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            throw new InvalidPasswordException();
        }

        // Generate JWT
        String jwt = jwtUtils.generateJwtToken(user.getId());
        return new JwtResponse(jwt);
    }

    /**
     * “Logout” – since JWTs are stateless, a common approach is to do nothing here (or to blacklist the token).
     * For simplicity, we'll just return a message. If you want true logout semantics, maintain a blacklist.
     */
    @Override
    @Transactional
    public MessageResponse logoutUser(String token) {
        // If you want to blacklist tokens, add `token` to a persistent store here.
        return new MessageResponse("Logged out successfully!");
    }

    @Override
    public void checkEmailExists(String email) throws EmailAlreadyExistsException {
        if (userRepository.existsByEmail(email.toLowerCase().trim())) {
            throw new EmailAlreadyExistsException("Email is already in use.");
        }
    }
}
