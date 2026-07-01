package com.adventure.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CloudinaryFileResponse {

    private String publicId;

    private String url;

    private String format;

    private String resourceType;

    private Integer width;

    private Integer height;

    private Long bytes;

    private String createdAt;
}