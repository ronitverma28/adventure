package com.adventure.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TravelerResponse {
    private Long id;
    private String name;
    private Integer age;
    private String gender;
    private String idType;
    private String idNumber;
    private String medicalConditions;
    private Boolean isLeader;
}
