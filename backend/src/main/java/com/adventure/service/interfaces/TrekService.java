package com.adventure.service.interfaces;

import com.adventure.dto.request.TrekFilterRequest;
import com.adventure.dto.response.*;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface TrekService {
    PagedResponse<TrekCardResponse> getTreks(TrekFilterRequest filter, Pageable pageable);
    TrekDetailResponse getTrek(Long id);
    TrekDetailResponse getTrekBySlug(String slug);
    PagedResponse<TrekCardResponse> getFeaturedTreks(Pageable pageable);
    PagedResponse<TrekCardResponse> getBestsellerTreks(Pageable pageable);
    PagedResponse<TrekCardResponse> searchTreks(String keyword, Pageable pageable);
    PagedResponse<TrekCardResponse> filterTreks(TrekFilterRequest filter, Pageable pageable);
    List<RelatedTrekResponse> getRelatedTreks(Long id);
    List<TrekAvailabilityResponse> getAvailability(Long id);
}
