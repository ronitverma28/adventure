package com.adventure.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CloudinaryFileResponse {

    private String publicId;

    private String assetId;

    private String url;

    private String secureUrl;

    private String format;

    private String resourceType;

    private String folder;

    private Long bytes;

    private Integer width;

    private Integer height;

    private String createdAt;

}