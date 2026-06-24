package com.adventure.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateReplyRequest {
    @NotBlank
    private String content;
}
