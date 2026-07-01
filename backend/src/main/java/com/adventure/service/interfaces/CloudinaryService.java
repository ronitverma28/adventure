package com.adventure.service.interfaces;

import com.adventure.dto.response.CloudinaryFileResponse;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

public interface CloudinaryService {
    Map uploadImage(MultipartFile file, String folder) throws IOException;
    void delete(String publicId);
    List<CloudinaryFileResponse> getAllFiles();
    List<CloudinaryFileResponse> getAllFiles(String folderName);
    List<String> getAllFolders();

}
