package com.adventure.service.impl;

import com.adventure.dto.response.CloudinaryFileResponse;
import com.adventure.exception.BadRequestException;
import com.adventure.service.interfaces.CloudinaryService;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CloudinaryServiceImpl implements CloudinaryService {

    @Value("${cloudinary.folder}")
    private String CLOUDINARY_PARENT_FOLDER;

    private final Cloudinary cloudinary;

    private static final int PAGE_SIZE = 50;

    @Override
    @CacheEvict(value = "cloudinary-images", allEntries = true)
    public String upload(MultipartFile file, String folder) {

        try {

            Map<?, ?> result = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", folder,
                            "resource_type", "auto"
                    )
            );

            return result.get("secure_url").toString();

        } catch (IOException e) {
            throw new BadRequestException("Failed to upload file to Cloudinary.");
        }
    }

    @Override
    @CacheEvict(value = "cloudinary-images", allEntries = true)
    public void delete(String publicId) {

        try {

            cloudinary.uploader().destroy(
                    publicId,
                    ObjectUtils.emptyMap()
            );

        } catch (Exception e) {
            throw new BadRequestException("Failed to delete file from Cloudinary.");
        }
    }


    @Override
    @Cacheable(value = "cloudinary-images", key = "'ALL_FILES'")
    @SuppressWarnings("unchecked")
    public List<CloudinaryFileResponse> getAllFiles() {

        try {

            Map<String, Object> result = (Map<String, Object>) cloudinary.api().resources(
                    ObjectUtils.asMap(
                            "type", "upload",
                            "max_results", PAGE_SIZE
                    )
            );

            return mapFiles(result);

        } catch (Exception e) {
            throw new BadRequestException("Failed to fetch Cloudinary files.");
        }
    }
    @Override
    @SuppressWarnings("unchecked")
    @Cacheable(value = "cloudinary-folders", key = "'ALL_FOLDERS'")
    public List<String> getAllFolders() {

        try {

            Map<String, Object> result = (Map<String, Object>) cloudinary.api().subFolders(
                    CLOUDINARY_PARENT_FOLDER,
                    ObjectUtils.asMap()
            );

            List<Map<String, Object>> folders =
                    (List<Map<String, Object>>) result.get("folders");

            return folders.stream()
                    .map(folder -> (String) folder.get("name"))
                    .toList();

        } catch (Exception e) {
            throw new BadRequestException("Failed to fetch folders.");
        }
    }

    @Override
    @Cacheable(value = "cloudinary-images", key = "#folderName")
    @SuppressWarnings("unchecked")
    public List<CloudinaryFileResponse> getAllFiles(String folderName) {

        try {

            Map<String, Object> result = (Map<String, Object>) cloudinary.api().resources(
                    ObjectUtils.asMap(
                            "asset_folder", CLOUDINARY_PARENT_FOLDER + "/" + folderName,
                            "max_results", PAGE_SIZE
                    )
            );

            return mapFiles(result);

        } catch (Exception e) {
            throw new BadRequestException("Failed to fetch Cloudinary files.");
        }
    }



    @SuppressWarnings("unchecked")
    private List<CloudinaryFileResponse> mapFiles(Map<String, Object> result) {

        List<Map<String, Object>> resources =
                (List<Map<String, Object>>) result.getOrDefault(
                        "resources",
                        Collections.emptyList()
                );

        return resources.stream()
                .map(this::toResponse)
                .toList();
    }

    private CloudinaryFileResponse toResponse(Map<String, Object> file) {

        return CloudinaryFileResponse.builder()
                .publicId((String) file.get("public_id"))
                .url((String) file.get("secure_url"))
                .format((String) file.get("format"))
                .resourceType((String) file.get("resource_type"))
                .width(file.get("width") == null ? null : ((Number) file.get("width")).intValue())
                .height(file.get("height") == null ? null : ((Number) file.get("height")).intValue())
                .bytes(file.get("bytes") == null ? null : ((Number) file.get("bytes")).longValue())
                .createdAt(file.get("created_at") == null ? null : file.get("created_at").toString())
                .build();
    }
}