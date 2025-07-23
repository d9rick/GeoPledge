package com.geopledge.auth;

import com.geopledge.auth.dto.JwtResponse;
import com.geopledge.auth.dto.LoginRequest;
import com.geopledge.auth.dto.MessageResponse;
import com.geopledge.auth.dto.SignupRequest;
import com.geopledge.exception.EmailAlreadyExistsException;
import com.geopledge.exception.InvalidPasswordException;
import com.geopledge.exception.UserNotFoundException;

public interface AuthService {
    /**
     * Register a new user. If email is already taken, throw an exception.
     * @param signupRequest { email, password }
     * @return a MessageResponse (e.g. "User registered successfully")
     */
    MessageResponse registerUser(SignupRequest signupRequest) throws EmailAlreadyExistsException;

    /**
     * Authenticate user credentials, generate a JWT if valid.
     * @param loginRequest { email, password }
     * @return JwtResponse containing the token
     */
    JwtResponse authenticateUser(LoginRequest loginRequest) throws UserNotFoundException, InvalidPasswordException;

    void checkEmailExists(String email) throws EmailAlreadyExistsException;

    /**
     * Invalidate the current token or session so the user is effectively logged out.
     * @param token the raw token to invalidate (if using JWT blacklist), or null if using session-based logout.
     * @return MessageResponse (e.g. "Logged out successfully").
     */
    MessageResponse logoutUser(String token);
}