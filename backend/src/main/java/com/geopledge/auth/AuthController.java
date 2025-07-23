package com.geopledge.auth;


import com.geopledge.auth.dto.JwtResponse;
import com.geopledge.auth.dto.LoginRequest;
import com.geopledge.auth.dto.MessageResponse;
import com.geopledge.auth.dto.SignupRequest;
import com.geopledge.auth.dto.CheckEmailRequest;
import com.geopledge.exception.EmailAlreadyExistsException;
import com.geopledge.exception.InvalidPasswordException;
import com.geopledge.exception.UserNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Handles user signup, login (issuing a JWT), and logout (invalidating token/session).
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    @Autowired
    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * POST /api/auth/signup
     * Request body: { "email": "...", "password": "..." }
     * Response: 200 OK + { "message": "User registered successfully!" }
     */
    @PostMapping("/signup")
    public ResponseEntity<MessageResponse> registerUser(
            @Valid @RequestBody SignupRequest signupRequest) throws EmailAlreadyExistsException {
        MessageResponse response = authService.registerUser(signupRequest);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/auth/login
     * Request body: { "email": "...", "password": "..." }
     * Response: 200 OK + { "token": "xxx.yyy.zzz", "tokenType": "Bearer" }
     */
    @PostMapping("/login")
    public ResponseEntity<JwtResponse> authenticateUser(
            @Valid @RequestBody LoginRequest loginRequest) throws UserNotFoundException, InvalidPasswordException {
        JwtResponse jwtResponse = authService.authenticateUser(loginRequest);
        return ResponseEntity.ok(jwtResponse);
    }

    @PostMapping("/check-email")
    public ResponseEntity<?> checkEmail(@Valid @RequestBody CheckEmailRequest checkEmailRequest) {
        authService.checkEmailExists(checkEmailRequest.getEmail());
        return ResponseEntity.ok().build();
    }

    /**
     * POST /api/auth/logout
     * In a JWT setup, the client must send its token in the Authorization header,
     * and we can extract it to blacklist or otherwise invalidate.
     *
     * If you use HttpSession-based auth, you can simply call request.getSession().invalidate().
     *
     * @param request so we can pull the "Authorization: Bearer <token>" header
     * @return 200 OK + { "message": "Logged out successfully!" }
     */
    @PostMapping("/logout")
    public ResponseEntity<MessageResponse> logoutUser(HttpServletRequest request) {
        // 1) Extract the raw token from the Authorization header
        String header = request.getHeader("Authorization");
        String token = null;
        if (header != null && header.startsWith("Bearer ")) {
            token = header.substring(7);
        }

        // 2) Pass it to authService to invalidate (or clear session if using sessions)
        MessageResponse response = authService.logoutUser(token);
        return ResponseEntity.ok(response);
    }
}