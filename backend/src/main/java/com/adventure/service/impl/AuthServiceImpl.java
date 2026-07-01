package com.adventure.service.impl;

import com.adventure.dto.request.*;
import com.adventure.dto.response.AuthResponse;
import com.adventure.dto.response.UserResponse;
import com.adventure.entity.*;
import com.adventure.exception.BadRequestException;
import com.adventure.exception.ResourceNotFoundException;
import com.adventure.exception.UnauthorizedException;
import com.adventure.repository.*;
import com.adventure.security.JwtTokenProvider;
import com.adventure.service.interfaces.AuthService;
import com.adventure.service.interfaces.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AuthServiceImpl implements AuthService {

    private final UserRepository                       userRepository;
    private final RoleRepository                       roleRepository;
    private final RefreshTokenRepository               refreshTokenRepository;
    private final EmailVerificationTokenRepository     emailVerificationTokenRepository;
    private final PasswordResetTokenRepository         passwordResetTokenRepository;
    private final PasswordEncoder                      passwordEncoder;
    private final JwtTokenProvider                     jwtTokenProvider;
    private final AuthenticationManager                authenticationManager;
    private final NotificationService                  notificationService;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Override
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail()))
            throw new BadRequestException("Email already registered. Please login.");
        if (request.getPhone() != null && userRepository.existsByPhone(request.getPhone()))
            throw new BadRequestException("Phone number already registered.");

        Role userRole = roleRepository.findByName("ROLE_USER")
            .orElseThrow(() -> new RuntimeException("Default role not found"));

        User user = User.builder()
            .name(request.getName())
            .email(request.getEmail())
            .passwordHash(passwordEncoder.encode(request.getPassword()))
            .phone(request.getPhone())
            .roles(Set.of(userRole))
            .isActive(true).isVerified(false).emailVerified(false)
            .build();
        user = userRepository.save(user);
        sendVerificationEmail(user);

        return buildAuthResponse(user,
            jwtTokenProvider.generateToken(user.getEmail()),
            createRefreshToken(user));
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        Authentication auth = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new UnauthorizedException("User not found"));
        return buildAuthResponse(user,
            jwtTokenProvider.generateToken(auth),
            createRefreshToken(user));
    }

    @Override
    public AuthResponse refreshToken(String tokenValue) {
        RefreshToken rt = refreshTokenRepository.findByToken(tokenValue)
            .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));
        if (!rt.isValid()) throw new UnauthorizedException("Refresh token expired or revoked.");

        User user = rt.getUser();
        rt.setRevokedAt(Instant.now());
        refreshTokenRepository.save(rt);

        return buildAuthResponse(user,
            jwtTokenProvider.generateToken(user.getEmail()),
            createRefreshToken(user));
    }

    @Override
    public void logout(String accessToken) {
        if (accessToken != null && accessToken.startsWith("Bearer ")) {
            try {
                String email = jwtTokenProvider.extractEmail(accessToken.substring(7));
                userRepository.findByEmail(email).ifPresent(u ->
                    refreshTokenRepository.revokeAllByUserId(u.getId()));
            } catch (Exception ignored) {}
        }
    }

    @Override
    public void forgotPassword(ForgotPasswordRequest request) {
        userRepository.findByEmail(request.getEmail()).ifPresent(user -> {
            passwordResetTokenRepository.deleteByUserId(user.getId());
            String token = UUID.randomUUID().toString();
            passwordResetTokenRepository.save(PasswordResetToken.builder()
                .token(token).user(user)
                .expiresAt(Instant.now().plus(1, ChronoUnit.HOURS)).build());
            notificationService.sendPasswordResetEmail(user.getEmail(), user.getName(),
                frontendUrl + "/reset-password?token=" + token);
        });
    }

    @Override
    public void resetPassword(ResetPasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword()))
            throw new BadRequestException("Passwords do not match");
        PasswordResetToken rt = passwordResetTokenRepository.findByToken(request.getToken())
            .orElseThrow(() -> new BadRequestException("Invalid or expired reset token"));
        if (rt.isExpired()) throw new BadRequestException("Reset token has expired");
        if (rt.isUsed())    throw new BadRequestException("Reset token already used");

        User user = rt.getUser();
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        rt.setUsedAt(Instant.now());
        passwordResetTokenRepository.save(rt);
        refreshTokenRepository.revokeAllByUserId(user.getId());
        notificationService.sendPasswordChangedEmail(user.getEmail(), user.getName());
    }

    @Override
    public void verifyEmail(String tokenValue) {
        EmailVerificationToken token = emailVerificationTokenRepository.findByToken(tokenValue)
            .orElseThrow(() -> new BadRequestException("Invalid verification token"));
        if (token.isExpired()) throw new BadRequestException("Verification token has expired");
        if (token.isUsed())    throw new BadRequestException("Email already verified");

        User user = token.getUser();
        user.setEmailVerified(true); user.setIsVerified(true);
        userRepository.save(user);
        token.setUsedAt(Instant.now());
        emailVerificationTokenRepository.save(token);
        notificationService.sendWelcomeEmail(user.getEmail(), user.getName());
    }

    @Override
    public void resendVerificationEmail(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        if (user.getEmailVerified()) throw new BadRequestException("Email already verified");
        emailVerificationTokenRepository.deleteByUserId(user.getId());
        sendVerificationEmail(user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(String email) {
        return toUserResponse(userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User", "email", email)));
    }

    @Override
    public UserResponse updateProfile(String email, UpdateProfileRequest req) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        if (req.getName()        != null) user.setName(req.getName());
        if (req.getPhone()       != null) user.setPhone(req.getPhone());
        if (req.getGender()      != null) user.setGender(req.getGender());
        if (req.getDateOfBirth() != null) user.setDateOfBirth(req.getDateOfBirth());
        if (req.getAddress()     != null) user.setAddress(req.getAddress());
        if (req.getCity()        != null) user.setCity(req.getCity());
        if (req.getState()       != null) user.setState(req.getState());
        if (req.getCountry()     != null) user.setCountry(req.getCountry());
        if (req.getAvatarUrl()   != null) user.setAvatarUrl(req.getAvatarUrl());
        return toUserResponse(userRepository.save(user));
    }

    @Override
    public void changePassword(String email, ChangePasswordRequest req) {
        if (!req.getNewPassword().equals(req.getConfirmPassword()))
            throw new BadRequestException("Passwords do not match");
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        if (!passwordEncoder.matches(req.getCurrentPassword(), user.getPasswordHash()))
            throw new BadRequestException("Current password is incorrect");
        user.setPasswordHash(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);
        refreshTokenRepository.revokeAllByUserId(user.getId());
    }

    // ── Helpers ──
    private String createRefreshToken(User user) {
        String val = UUID.randomUUID().toString();
        refreshTokenRepository.save(RefreshToken.builder()
            .token(val).user(user)
            .expiresAt(Instant.now().plus(7, ChronoUnit.DAYS)).build());
        return val;
    }

    private void sendVerificationEmail(User user) {
        String token = UUID.randomUUID().toString();
        emailVerificationTokenRepository.save(EmailVerificationToken.builder()
            .token(token).user(user)
            .expiresAt(Instant.now().plus(24, ChronoUnit.HOURS)).build());
        notificationService.sendEmailVerification(user.getEmail(), user.getName(),
            frontendUrl + "/verify-email?token=" + token);
    }

    private AuthResponse buildAuthResponse(User user, String access, String refresh) {
        return AuthResponse.builder()
            .accessToken(access).refreshToken(refresh).tokenType("Bearer")
            .userId(user.getId()).name(user.getName()).email(user.getEmail())
            .avatarUrl(user.getAvatarUrl())
            .roles(user.getRoles().stream().map(Role::getName).collect(Collectors.toList()))
            .build();
    }

    private UserResponse toUserResponse(User user) {
        return UserResponse.builder()
            .id(user.getId()).name(user.getName()).email(user.getEmail())
            .phone(user.getPhone()).avatarUrl(user.getAvatarUrl())
            .gender(user.getGender()).dateOfBirth(user.getDateOfBirth())
            .address(user.getAddress()).city(user.getCity())
            .state(user.getState()).country(user.getCountry())
            .isVerified(user.getIsVerified()).emailVerified(user.getEmailVerified())
            .phoneVerified(user.getPhoneVerified())
                .roles(user.getRoles())
            .build();
    }
}
