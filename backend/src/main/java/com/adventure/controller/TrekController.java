package com.adventure.controller;

import com.adventure.dto.request.TrekFilterRequest;
import com.adventure.dto.response.*;
import com.adventure.service.interfaces.TrekService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/treks")
@RequiredArgsConstructor
@Tag(name = "Treks", description = "Public trek browsing endpoints")
public class TrekController {

    private final TrekService trekService;

    @GetMapping
    @Operation(summary = "List public treks")
    public ResponseEntity<ApiResponse<PagedResponse<TrekCardResponse>>> getTreks(
            @ModelAttribute TrekFilterRequest filter,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size

    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(ApiResponse.success(trekService.getTreks(filter, pageable)));
    }

    @GetMapping("/featured")
    @Operation(summary = "List featured treks")
    public ResponseEntity<ApiResponse<PagedResponse<TrekCardResponse>>> getFeaturedTreks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size
    ) {
        return ResponseEntity.ok(ApiResponse.success(trekService.getFeaturedTreks(PageRequest.of(page, size))));
    }

    @GetMapping("/bestsellers")
    @Operation(summary = "List bestseller treks")
    public ResponseEntity<ApiResponse<PagedResponse<TrekCardResponse>>> getBestsellerTreks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size
    ) {
        return ResponseEntity.ok(ApiResponse.success(trekService.getBestsellerTreks(PageRequest.of(page, size))));
    }

    @GetMapping("/search")
    @Operation(summary = "Search treks")
    public ResponseEntity<ApiResponse<PagedResponse<TrekCardResponse>>> searchTreks(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size
    ) {
        String query = keyword != null ? keyword : search;
        return ResponseEntity.ok(ApiResponse.success(trekService.searchTreks(query, PageRequest.of(page, size))));
    }

    @GetMapping("/filter")
    @Operation(summary = "Filter treks")
    public ResponseEntity<ApiResponse<PagedResponse<TrekCardResponse>>> filterTreks(
            @ModelAttribute TrekFilterRequest filter,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size
    ) {
        return ResponseEntity.ok(ApiResponse.success(trekService.filterTreks(filter, PageRequest.of(page, size))));
    }

    @GetMapping("/slug/{slug}")
    @Operation(summary = "Get trek by slug")
    public ResponseEntity<ApiResponse<TrekDetailResponse>> getTrekBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(ApiResponse.success(trekService.getTrekBySlug(slug)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get trek details")
    public ResponseEntity<ApiResponse<TrekDetailResponse>> getTrek(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(trekService.getTrek(id)));
    }

    @GetMapping("/{id}/related")
    @Operation(summary = "Get related treks")
    public ResponseEntity<ApiResponse<List<RelatedTrekResponse>>> getRelatedTreks(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(trekService.getRelatedTreks(id)));
    }

    @GetMapping("/{id}/availability")
    @Operation(summary = "Get trek availability")
    public ResponseEntity<ApiResponse<List<TrekAvailabilityResponse>>> getAvailability(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(trekService.getAvailability(id)));
    }
}
