package com.adventure.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class TrekImageRequest {

    @NotBlank
    @Size(max = 500)
    private String imageUrl;

    @Size(max = 300)
    private String publicId;

    @Size(max = 200)
    private String altText;

    @Size(max = 300)
    private String caption;

    private Boolean isCover;

    private Integer displayOrder;
}