package com.adventure.service.impl;

import com.adventure.dto.request.TrekFilterRequest;
import com.adventure.dto.response.*;
import com.adventure.entity.Batch;
import com.adventure.entity.Trek;
import com.adventure.enums.TrekStatus;
import com.adventure.exception.ResourceNotFoundException;
import com.adventure.repository.BatchRepository;
import com.adventure.repository.BookingRepository;
import com.adventure.repository.TrekRepository;
import com.adventure.service.interfaces.TrekService;
import com.adventure.specification.TrekSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TrekServiceImpl implements TrekService {

    private static final int RELATED_LIMIT = 6;

    private final TrekRepository trekRepository;
    private final BatchRepository batchRepository;
    private final BookingRepository bookingRepository;

    @Override
    public PagedResponse<TrekCardResponse> getTreks(TrekFilterRequest filter, Pageable pageable) {
        return filterTreks(filter, withSort(pageable, filter != null ? filter.getSort() : null));
    }

    @Override
    public TrekDetailResponse getTrek(Long id) {
        Trek trek = trekRepository.findByIdAndStatus(id, TrekStatus.ACTIVE)
            .orElseThrow(() -> new ResourceNotFoundException("Trek", id));
        return toDetailResponse(trek);
    }

    @Override
    public TrekDetailResponse getTrekBySlug(String slug) {
        Trek trek = trekRepository.findBySlugAndStatus(slug, TrekStatus.ACTIVE)
            .orElseThrow(() -> new ResourceNotFoundException("Trek", "slug", slug));
        return toDetailResponse(trek);
    }

    @Override
    public PagedResponse<TrekCardResponse> getFeaturedTreks(Pageable pageable) {
        return toPagedResponse(trekRepository.findByIsFeaturedTrueAndStatus(
            TrekStatus.ACTIVE,
            withSort(pageable, "featured")
        ).map(this::toCardResponse));
    }

    @Override
    public PagedResponse<TrekCardResponse> getBestsellerTreks(Pageable pageable) {
        return toPagedResponse(trekRepository.findByIsBestsellerTrueAndStatus(
            TrekStatus.ACTIVE,
            withSort(pageable, "popular")
        ).map(this::toCardResponse));
    }

    @Override
    public PagedResponse<TrekCardResponse> searchTreks(String keyword, Pageable pageable) {
        TrekFilterRequest filter = new TrekFilterRequest();
        filter.setSearch(keyword);
        return filterTreks(filter, withSort(pageable, null));
    }

    @Override
    public PagedResponse<TrekCardResponse> filterTreks(TrekFilterRequest filter, Pageable pageable) {
        Page<Trek> page = trekRepository.findAll(TrekSpecification.publicFilters(filter), pageable);
        return toPagedResponse(page.map(this::toCardResponse));
    }

    @Override
    public List<RelatedTrekResponse> getRelatedTreks(Long id) {
        Trek trek = trekRepository.findByIdAndStatus(id, TrekStatus.ACTIVE)
            .orElseThrow(() -> new ResourceNotFoundException("Trek", id));

        TrekFilterRequest filter = new TrekFilterRequest();
        filter.setRegion(trek.getRegion());
        filter.setState(trek.getState());
        filter.setDifficulty(trek.getDifficulty());

        return trekRepository.findAll(
                TrekSpecification.publicFilters(filter),
                PageRequest.of(0, RELATED_LIMIT + 1, Sort.by(Sort.Direction.DESC, "avgRating"))
            )
            .stream()
            .filter(candidate -> !candidate.getId().equals(id))
            .limit(RELATED_LIMIT)
            .map(this::toRelatedResponse)
            .toList();
    }

    @Override
    public List<TrekAvailabilityResponse> getAvailability(Long id) {
        Trek trek = trekRepository.findByIdAndStatus(id, TrekStatus.ACTIVE)
            .orElseThrow(() -> new ResourceNotFoundException("Trek", id));

        LocalDate today = LocalDate.now();
        List<TrekAvailabilityResponse> availability = new ArrayList<>(
            batchRepository.findByTrekIdAndStartDateGreaterThanEqualAndIsActiveTrueOrderByStartDateAsc(id, today)
                .stream()
                .map(this::toAvailabilityResponse)
                .toList()
        );

        if (availability.isEmpty() && trek.getStartDate() != null && !trek.getStartDate().isBefore(today)) {
            int totalSlots = trek.getGroupSizeMax() != null ? trek.getGroupSizeMax() : 0;
            int bookedSlots = bookingRepository.countConfirmedPersonsForTrekDate(id, trek.getStartDate());
            availability.add(TrekAvailabilityResponse.builder()
                .trekId(trek.getId())
                .startDate(trek.getStartDate())
                .endDate(trek.getEndDate())
                .totalSlots(totalSlots)
                .availableSlots(Math.max(totalSlots - bookedSlots, 0))
                .pricePerPerson(trek.getPricePerPerson())
                .meetingPoint(trek.getMeetingPoint())
                .build());
        }

        return availability;
    }

    private Pageable withSort(Pageable pageable, String sort) {
        Sort resolvedSort = switch (StringUtils.hasText(sort) ? sort.trim().toLowerCase() : "newest") {
            case "price_asc", "price-asc", "priceasc" -> Sort.by(Sort.Direction.ASC, "pricePerPerson");
            case "price_desc", "price-desc", "pricedesc" -> Sort.by(Sort.Direction.DESC, "pricePerPerson");
            case "rating", "top_rated", "top-rated" -> Sort.by(Sort.Direction.DESC, "avgRating");
            case "popular", "bestseller", "bestsellers" -> Sort.by(Sort.Direction.DESC, "totalBookings");
            case "duration_asc", "duration-asc" -> Sort.by(Sort.Direction.ASC, "durationDays");
            case "duration_desc", "duration-desc" -> Sort.by(Sort.Direction.DESC, "durationDays");
            case "featured" -> Sort.by(Sort.Direction.DESC, "isFeatured").and(Sort.by(Sort.Direction.DESC, "createdAt"));
            default -> Sort.by(Sort.Direction.DESC, "createdAt");
        };
        return PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), resolvedSort);
    }

    private TrekCardResponse toCardResponse(Trek trek) {
        return TrekCardResponse.builder()
            .id(trek.getId())
            .title(trek.getTitle())
            .slug(trek.getSlug())
            .shortDescription(trek.getShortDescription())
            .location(trek.getLocation())
            .state(trek.getState())
            .region(trek.getRegion())
            .durationDays(trek.getDurationDays())
            .durationNights(trek.getDurationNights())
            .difficulty(trek.getDifficulty())
            .pricePerPerson(trek.getPricePerPerson())
            .avgRating(trek.getAvgRating())
            .totalReviews(trek.getTotalReviews())
            .coverImageUrl(trek.getCoverImageUrl())
            .isFeatured(trek.getIsFeatured())
            .isBestseller(trek.getIsBestseller())
            .build();
    }

    private RelatedTrekResponse toRelatedResponse(Trek trek) {
        return RelatedTrekResponse.builder()
            .id(trek.getId())
            .title(trek.getTitle())
            .slug(trek.getSlug())
            .location(trek.getLocation())
            .state(trek.getState())
            .region(trek.getRegion())
            .durationDays(trek.getDurationDays())
            .difficulty(trek.getDifficulty())
            .pricePerPerson(trek.getPricePerPerson())
            .avgRating(trek.getAvgRating())
            .coverImageUrl(trek.getCoverImageUrl())
            .build();
    }

    private TrekDetailResponse toDetailResponse(Trek trek) {
        return TrekDetailResponse.builder()
            .id(trek.getId())
            .title(trek.getTitle())
            .slug(trek.getSlug())
            .shortDescription(trek.getShortDescription())
            .description(trek.getDescription())
            .location(trek.getLocation())
            .state(trek.getState())
            .region(trek.getRegion())
            .latitude(trek.getLatitude())
            .longitude(trek.getLongitude())
            .altitudeMax(trek.getAltitudeMax())
            .altitudeBase(trek.getAltitudeBase())
            .durationDays(trek.getDurationDays())
            .durationNights(trek.getDurationNights())
            .difficulty(trek.getDifficulty())
            .pricePerPerson(trek.getPricePerPerson())
            .priceChild(trek.getPriceChild())
            .groupSizeMin(trek.getGroupSizeMin())
            .groupSizeMax(trek.getGroupSizeMax())
            .startDate(trek.getStartDate())
            .endDate(trek.getEndDate())
            .meetingPoint(trek.getMeetingPoint())
            .nearestAirport(trek.getNearestAirport())
            .nearestRailway(trek.getNearestRailway())
            .isFeatured(trek.getIsFeatured())
            .isBestseller(trek.getIsBestseller())
            .avgRating(trek.getAvgRating())
            .totalReviews(trek.getTotalReviews())
            .totalBookings(trek.getTotalBookings())
            .coverImageUrl(trek.getCoverImageUrl())
            .metaTitle(trek.getMetaTitle())
            .metaDescription(trek.getMetaDescription())
            .highlights(toArray(trek.getHighlights()))
            .inclusions(toArray(trek.getInclusions()))
            .exclusions(toArray(trek.getExclusions()))
            .thingsToCarry(toArray(trek.getThingsToCarry()))
            .images(trek.getImages().stream()
                .map(image -> TrekDetailResponse.ImageResponse.builder()
                    .id(image.getId())
                    .imageUrl(image.getImageUrl())
                    .altText(image.getAltText())
                    .caption(image.getCaption())
                    .isCover(image.getIsCover())
                    .displayOrder(image.getDisplayOrder())
                    .build())
                .toList())
            .itinerary(trek.getItinerary().stream()
                .map(item -> TrekDetailResponse.ItineraryResponse.builder()
                    .id(item.getId())
                    .dayNumber(item.getDayNumber())
                    .title(item.getTitle())
                    .description(item.getDescription())
                    .distanceKm(item.getDistanceKm())
                    .elevationGain(item.getElevationGain())
                    .elevationLoss(item.getElevationLoss())
                    .maxAltitude(item.getMaxAltitude())
                    .accommodation(item.getAccommodation())
                    .mealsIncluded(toArray(item.getMealsIncluded()))
                    .difficultyDay(item.getDifficultyDay())
                    .tips(item.getTips())
                    .build())
                .toList())
            .guides(trek.getGuides().stream()
                .sorted(Comparator.comparing(guide -> guide.getName() == null ? "" : guide.getName()))
                .map(guide -> TrekDetailResponse.GuideResponse.builder()
                    .id(guide.getId())
                    .name(guide.getName())
                    .bio(guide.getBio())
                    .photoUrl(guide.getPhotoUrl())
                    .experienceYears(guide.getExperienceYears())
                    .languages(toArray(guide.getLanguages()))
                    .certifications(toArray(guide.getCertifications()))
                    .specializations(toArray(guide.getSpecializations()))
                    .avgRating(guide.getAvgRating())
                    .isVerified(guide.getIsVerified())
                    .build())
                .toList())
            .build();
    }

    private TrekAvailabilityResponse toAvailabilityResponse(Batch batch) {
        return TrekAvailabilityResponse.builder()
            .batchId(batch.getId())
            .trekId(batch.getTrek().getId())
            .startDate(batch.getStartDate())
            .endDate(batch.getEndDate())
            .totalSlots(batch.getTotalSlots())
            .availableSlots(batch.getAvailableSlots())
            .pricePerPerson(batch.getPricePerPerson() != null ? batch.getPricePerPerson() : batch.getTrek().getPricePerPerson())
            .meetingPoint(StringUtils.hasText(batch.getMeetingPoint()) ? batch.getMeetingPoint() : batch.getTrek().getMeetingPoint())
            .build();
    }

    private <T> PagedResponse<T> toPagedResponse(Page<T> page) {
        return PagedResponse.<T>builder()
            .content(page.getContent())
            .page(page.getNumber())
            .size(page.getSize())
            .totalElements(page.getTotalElements())
            .totalPages(page.getTotalPages())
            .first(page.isFirst())
            .last(page.isLast())
            .build();
    }

    private String[] toArray(List<String> values) {
        if (values == null || values.isEmpty()) {
            return new String[0];
        }
        return values.toArray(String[]::new);
    }
}
