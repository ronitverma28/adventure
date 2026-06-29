package com.adventure.config;

import com.cloudinary.Cloudinary;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class CloudConfig {
    @Value("${cloudinary.cloud-name}")
    private String CLOUD_NAME;
    @Value("${cloudinary.api-key}")
    private String CLOUD_API_KEY;
    @Value("${cloudinary.api-secret}")
    private String CLOUD_API_SECRET;

    @Bean
    public Cloudinary cloudinary(){
        Map<String, Object> config = new HashMap<>();

        config.put("cloud_name", CLOUD_NAME);
        config.put("api_key", CLOUD_API_KEY);
        config.put("api_secret", CLOUD_API_SECRET);
        config.put("secure", true);

        return new Cloudinary(config);
    }

}
