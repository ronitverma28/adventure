package com.adventure.dto.response;

import com.adventure.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String avatarUrl;
    private String gender;
    private LocalDate dateOfBirth;
    private String address;
    private String city;
    private String state;
    private String country;
    private Boolean isVerified;
    private Boolean isActive;
    private Boolean emailVerified;
    private Boolean phoneVerified;
    private Set<Role> roles;
    private Instant createdAt;
    private Instant updatedAt;

}
