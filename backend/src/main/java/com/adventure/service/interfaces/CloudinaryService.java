package com.adventure.service.interfaces;

import com.adventure.dto.response.CloudinaryFileResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface CloudinaryService {
    String upload(MultipartFile file, String folder);
    void delete(String publicId);
    List<CloudinaryFileResponse> getAllFiles();
    List<CloudinaryFileResponse> getAllFiles(String folderName);
    List<String> getAllFolders();

}
