package com.adventure.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class CreatePostRequest {
    @NotBlank
    @Size(max = 300)
    private String title;

    @NotBlank
    private String content;

    private String type = "EXPERIENCE"; // EXPERIENCE | PHOTO | QUESTION
    private Long trekId;
    private List<String> imageUrls;
}
