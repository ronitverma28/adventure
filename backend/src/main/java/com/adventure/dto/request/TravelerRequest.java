package com.adventure.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TravelerRequest {
    @NotBlank
    private String name;

    @NotNull
    @Min(5)
    @Max(80)
    private Integer age;

    @NotBlank
    private String gender;

    @NotBlank
    private String idType;

    @NotBlank
    private String idNumber;

    private Boolean isLeader = false;
}
