package com.adventure.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateDiscussionRequest {
    @NotBlank
    @Size(max = 300)
    private String title;

    @NotBlank
    private String body;

    private String category = "GENERAL";
    private Long trekId;
}
