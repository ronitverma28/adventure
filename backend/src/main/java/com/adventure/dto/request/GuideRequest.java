package com.adventure.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.List;

@Data
public class GuideRequest {

    private Long userId;

    @NotBlank
    @Size(max = 100)
    private String name;

    private String bio;

    @Size(max = 500)
    private String photoUrl;

    @Pattern(
            regexp = "^[0-9+\\-() ]{10,20}$",
            message = "Invalid phone number"
    )
    private String phone;

    @Email
    @Size(max = 150)
    private String email;

    @Min(0)
    private Integer experienceYears;

    private List<String> languages;

    private List<String> certifications;

    private List<String> specializations;

    private Boolean isAvailable;

    private Boolean isVerified;
}