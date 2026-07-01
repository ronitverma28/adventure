package com.adventure.service.impl;

import com.adventure.dto.request.*;
import com.adventure.dto.response.*;
import com.adventure.entity.*;
import com.adventure.enums.BatchStatus;
import com.adventure.enums.BookingStatus;
import com.adventure.enums.TrekStatus;
import com.adventure.exception.BadRequestException;
import com.adventure.exception.ResourceNotFoundException;
import com.adventure.repository.*;
import com.adventure.service.interfaces.AdminService;
import com.adventure.service.interfaces.CloudinaryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AdminServiceImpl implements AdminService {

    private final TrekRepository trekRepository;
    private final UserRepository userRepository;
    private final BatchRepository batchRepository;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final ReviewRepository reviewRepository;
    private final CouponRepository couponRepository;
    private final GuideRepository guideRepository;
    private final ItineraryRepository itineraryRepository;
    private final TrekImageRepository trekImageRepository;
    private final CloudinaryService cloudinaryService;

    // ── Analytics ────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public AdminStatsResponse getStats() {
        Instant monthStart = Instant.now().minus(30, ChronoUnit.DAYS);

        BigDecimal totalRevenue = bookingRepository.getTotalRevenue();
        BigDecimal monthlyRevenue = bookingRepository.getRevenueFrom(monthStart);
        if (totalRevenue == null) totalRevenue = BigDecimal.ZERO;
        if (monthlyRevenue == null) monthlyRevenue = BigDecimal.ZERO;

        List<AdminStatsResponse.PopularTrek> popular = trekRepository
            .findAll(Pageable.ofSize(5)).stream()
            .sorted((a, b) -> Integer.compare(b.getTotalBookings(), a.getTotalBookings()))
            .map(t -> AdminStatsResponse.PopularTrek.builder()
                .id(t.getId())
                .title(t.getTitle())
                .slug(t.getSlug())
                .totalBookings(t.getTotalBookings())
                .avgRating(t.getAvgRating() != null ? t.getAvgRating().doubleValue() : 0)
                .build())
            .toList();

        return AdminStatsResponse.builder()
            .totalUsers(userRepository.count())
            .totalTreks(trekRepository.count())
            .totalBookings(bookingRepository.count())
            .confirmedBookings(bookingRepository.countByStatus(BookingStatus.CONFIRMED))
            .pendingBookings(bookingRepository.countByStatus(BookingStatus.PENDING))
            .cancelledBookings(bookingRepository.countByStatus(BookingStatus.CANCELLED))
            .totalRevenue(totalRevenue)
            .monthlyRevenue(monthlyRevenue)
            .totalReviews(reviewRepository.count())
            .pendingReviews(reviewRepository.countByIsApproved(false))
            .totalGuides(guideRepository.count())
            .activeCoupons(couponRepository.count())
            .popularTreks(popular)
            .build();
    }

    // ── Trek management ───────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<TrekResponse> getAllTreks(String search, String status, Pageable pageable) {

        Page<Trek> page;

        boolean hasSearch = search != null && !search.isBlank();
        boolean hasStatus = status != null && !status.isBlank();

        if (!hasSearch && !hasStatus) {

            page = trekRepository.findAll(pageable);

        } else if (!hasStatus) {

            page = trekRepository
                    .findByTitleContainingIgnoreCaseOrLocationContainingIgnoreCaseOrStateContainingIgnoreCase(
                            search,
                            search,
                            search,
                            pageable
                    );

        } else if (!hasSearch) {

            TrekStatus trekStatus = TrekStatus.valueOf(status.toUpperCase());

            page = trekRepository.findByStatus(
                    trekStatus,
                    pageable
            );

        } else {

            TrekStatus trekStatus = TrekStatus.valueOf(status.toUpperCase());

            page = trekRepository
                    .findByStatusAndTitleContainingIgnoreCaseOrStatusAndLocationContainingIgnoreCaseOrStatusAndStateContainingIgnoreCase(
                            trekStatus,
                            search,
                            trekStatus,
                            search,
                            trekStatus,
                            search,
                            pageable
                    );
        }

        List<TrekResponse> treks = page.getContent()
                .stream()
                .map(this::toTrekResponse)
                .toList();

        return PagedResponse.<TrekResponse>builder()
                .content(treks)
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public TrekResponse getTrek(Long trekId) {

        Trek trek = trekRepository.findById(trekId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Trek not found with id: " + trekId
                ));

        return toTrekResponse(trek);
    }

    @Override
    @Transactional
    public TrekResponse createTrek(AdminTrekRequest request) {

        if (trekRepository.existsByTitleIgnoreCase(request.getTitle())) {
            throw new BadRequestException("Trek with title already exists.");
        }

        Trek trek = buildTrek(request);

        trek.setSlug(generateUniqueSlug(request.getTitle()));

        saveImages(trek, request.getImages());

        saveItinerary(trek, request.getItinerary());

        saveBatches(trek, request.getBatches());

        Trek savedTrek = trekRepository.save(trek);

        return toTrekResponse(savedTrek);
    }

    @Override
    @Transactional
    public TrekResponse updateTrek(Long trekId, AdminTrekRequest request) {

        Trek trek = trekRepository.findById(trekId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Trek not found with id: " + trekId));

        updateTrekDetails(trek, request);

        replaceImages(trek, request.getImages());

        replaceItinerary(trek, request.getItinerary());

        replaceBatches(trek, request.getBatches());

        Trek updated = trekRepository.save(trek);

        return toTrekResponse(updated);
    }

    @Override
    @Transactional
    public TrekResponse changeTrekStatus(Long trekId, TrekStatus status) {

        Trek trek = trekRepository.findById(trekId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Trek not found with id: " + trekId));

        trek.setStatus(status);

        Trek updated = trekRepository.save(trek);

        return toTrekResponse(updated);
    }

    @Override
    @Transactional
    public void deleteTrek(Long trekId) {

        Trek trek = trekRepository.findById(trekId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Trek not found with id: " + trekId));

        trekRepository.delete(trek);
    }

    @Override
    @Transactional
    public TrekDetailResponse.ImageResponse addTrekImage(Long trekId, TrekImageRequest request) {

        Trek trek = trekRepository.findById(trekId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Trek not found with id: " + trekId));

        TrekImage image = TrekImage.builder()
                .trek(trek)
                .imageUrl(request.getImageUrl())
                .publicId(request.getPublicId())
                .altText(request.getAltText())
                .caption(request.getCaption())
                .isCover(Boolean.TRUE.equals(request.getIsCover()))
                .displayOrder(request.getDisplayOrder() == null ? 0 : request.getDisplayOrder())
                .build();

        if (Boolean.TRUE.equals(image.getIsCover())) {
            trek.getImages().forEach(i -> i.setIsCover(false));
            trek.setCoverImageUrl(image.getImageUrl());
        }

        TrekImage saved = trekImageRepository.save(image);

        return toImageResponse(saved);
    }

    @Override
    @Transactional
    public TrekDetailResponse.ImageResponse updateTrekImage(Long imageId, TrekImageRequest request) {

        TrekImage image = trekImageRepository.findById(imageId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Image not found with id: " + imageId));

        image.setImageUrl(request.getImageUrl());
        image.setPublicId(request.getPublicId());
        image.setAltText(request.getAltText());
        image.setCaption(request.getCaption());
        image.setDisplayOrder(
                request.getDisplayOrder() == null ? 0 : request.getDisplayOrder()
        );

        if (Boolean.TRUE.equals(request.getIsCover())) {

            Trek trek = image.getTrek();

            trek.getImages().forEach(i -> i.setIsCover(false));

            image.setIsCover(true);

            trek.setCoverImageUrl(image.getImageUrl());

        } else {

            image.setIsCover(false);
        }

        TrekImage updated = trekImageRepository.save(image);

        return toImageResponse(updated);
    }

    @Override
    @Transactional
    public void deleteTrekImage(Long imageId) {

        TrekImage image = trekImageRepository.findById(imageId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Image not found with id: " + imageId));

        Trek trek = image.getTrek();

        if (Boolean.TRUE.equals(image.getIsCover())) {
            trek.setCoverImageUrl(null);
        }

        trekImageRepository.delete(image);
    }

    @Override
    @Transactional
    public TrekDetailResponse.ImageResponse setCoverImage(Long trekId, Long imageId) {

        Trek trek = trekRepository.findById(trekId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Trek not found with id: " + trekId));

        TrekImage image = trekImageRepository.findById(imageId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Image not found with id: " + imageId));

        if (!image.getTrek().getId().equals(trekId)) {
            throw new BadRequestException("Image does not belong to the specified trek.");
        }

        trek.getImages().forEach(i -> i.setIsCover(false));

        image.setIsCover(true);

        trek.setCoverImageUrl(image.getImageUrl());

        trekRepository.save(trek);

        return toImageResponse(image);
    }

    @Override
    @Transactional
    public TrekDetailResponse.ItineraryResponse addItineraryDay(Long trekId,ItineraryRequest request) {

        Trek trek = trekRepository.findById(trekId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Trek not found with id: " + trekId));

        boolean dayExists = trek.getItinerary().stream()
                .anyMatch(i -> i.getDayNumber().equals(request.getDayNumber()));

        if (dayExists) {
            throw new BadRequestException(
                    "Day " + request.getDayNumber() + " already exists."
            );
        }

        Itinerary itinerary = Itinerary.builder()
                .trek(trek)
                .dayNumber(request.getDayNumber())
                .title(request.getTitle())
                .description(request.getDescription())
                .distanceKm(request.getDistanceKm())
                .elevationGain(request.getElevationGain())
                .elevationLoss(request.getElevationLoss())
                .maxAltitude(request.getMaxAltitude())
                .accommodation(request.getAccommodation())
                .mealsIncluded(
                        request.getMealsIncluded() == null
                                ? new ArrayList<>()
                                : request.getMealsIncluded()
                )
                .difficultyDay(request.getDifficultyDay())
                .tips(request.getTips())
                .build();

        Itinerary saved = itineraryRepository.save(itinerary);

        return toItineraryResponse(saved);
    }

    @Override
    @Transactional
    public TrekDetailResponse.ItineraryResponse updateItineraryDay(Long itineraryId,ItineraryRequest request) {

        Itinerary itinerary = itineraryRepository.findById(itineraryId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Itinerary not found with id: " + itineraryId));

        Trek trek = itinerary.getTrek();

        boolean duplicateDay = trek.getItinerary().stream()
                .filter(i -> !i.getId().equals(itineraryId))
                .anyMatch(i -> i.getDayNumber().equals(request.getDayNumber()));

        if (duplicateDay) {
            throw new BadRequestException(
                    "Day " + request.getDayNumber() + " already exists."
            );
        }

        itinerary.setDayNumber(request.getDayNumber());
        itinerary.setTitle(request.getTitle());
        itinerary.setDescription(request.getDescription());
        itinerary.setDistanceKm(request.getDistanceKm());
        itinerary.setElevationGain(request.getElevationGain());
        itinerary.setElevationLoss(request.getElevationLoss());
        itinerary.setMaxAltitude(request.getMaxAltitude());
        itinerary.setAccommodation(request.getAccommodation());
        itinerary.setMealsIncluded(
                request.getMealsIncluded() == null
                        ? new ArrayList<>()
                        : request.getMealsIncluded()
        );
        itinerary.setDifficultyDay(request.getDifficultyDay());
        itinerary.setTips(request.getTips());

        Itinerary updated = itineraryRepository.save(itinerary);

        return toItineraryResponse(updated);
    }

    @Override
    @Transactional
    public void deleteItineraryDay(Long itineraryId) {

        Itinerary itinerary = itineraryRepository.findById(itineraryId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Itinerary not found with id: " + itineraryId));

        itineraryRepository.delete(itinerary);
    }

    @Override
    @Transactional
    public TrekDetailResponse.BatchResponse createBatch(Long trekId,BatchRequest request) {

        Trek trek = trekRepository.findById(trekId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Trek not found with id: " + trekId));

        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new BadRequestException(
                    "End date cannot be before start date."
            );
        }

        Batch batch = Batch.builder()
                .trek(trek)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .totalSlots(request.getTotalSlots())
                .availableSlots(request.getTotalSlots())
                .pricePerPerson(request.getPricePerPerson())
                .pricePerChild(request.getPricePerChild())
                .meetingPoint(request.getMeetingPoint())
                .status(
                        request.getStatus() == null
                                ? BatchStatus.UPCOMING
                                : request.getStatus()
                )
                .build();

        if (request.getGuideIds() != null && !request.getGuideIds().isEmpty()) {

            Set<Guide> guides = new HashSet<>(
                    guideRepository.findAllById(request.getGuideIds())
            );

            if (guides.size() != request.getGuideIds().size()) {
                throw new BadRequestException(
                        "One or more guides were not found."
                );
            }

            batch.setGuides(guides);
        }

        Batch saved = batchRepository.save(batch);

        return toBatchResponse(saved);
    }

    @Override
    @Transactional
    public TrekDetailResponse.BatchResponse updateBatch(Long batchId,BatchRequest request) {

        Batch batch = batchRepository.findById(batchId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Batch not found with id: " + batchId));

        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new BadRequestException(
                    "End date cannot be before start date."
            );
        }

        int bookedSlots = batch.getTotalSlots() - batch.getAvailableSlots();

        if (request.getTotalSlots() < bookedSlots) {
            throw new BadRequestException(
                    "Total slots cannot be less than already booked slots."
            );
        }

        batch.setStartDate(request.getStartDate());
        batch.setEndDate(request.getEndDate());
        batch.setTotalSlots(request.getTotalSlots());
        batch.setAvailableSlots(request.getTotalSlots() - bookedSlots);
        batch.setPricePerPerson(request.getPricePerPerson());
        batch.setPricePerChild(request.getPricePerChild());
        batch.setMeetingPoint(request.getMeetingPoint());
        batch.setStatus(
                request.getStatus() == null
                        ? BatchStatus.UPCOMING
                        : request.getStatus()
        );

        batch.getGuides().clear();

        if (request.getGuideIds() != null && !request.getGuideIds().isEmpty()) {

            Set<Guide> guides = new HashSet<>(
                    guideRepository.findAllById(request.getGuideIds())
            );

            if (guides.size() != request.getGuideIds().size()) {
                throw new BadRequestException(
                        "One or more guides were not found."
                );
            }

            batch.getGuides().addAll(guides);
        }

        Batch updated = batchRepository.save(batch);

        return toBatchResponse(updated);
    }

    @Override
    @Transactional
    public void deleteBatch(Long batchId) {

        Batch batch = batchRepository.findById(batchId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Batch not found with id: " + batchId));

        int bookedSlots = batch.getTotalSlots() - batch.getAvailableSlots();

        if (bookedSlots > 0) {
            throw new BadRequestException(
                    "Cannot delete a batch that already has bookings."
            );
        }

        batchRepository.delete(batch);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<AdminGuideResponse> getAllGuides(Pageable pageable) {

        Page<Guide> page = guideRepository.findAll(pageable);

        List<AdminGuideResponse> guides = page.getContent()
                .stream()
                .map(this::toGuideResponse)
                .toList();

        return PagedResponse.<AdminGuideResponse>builder()
                .content(guides)
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .build();
    }


    @Override
    @Transactional(readOnly = true)
    public AdminGuideResponse getGuide(Long guideId) {

        Guide guide = guideRepository.findById(guideId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Guide not found with id: " + guideId));

        return toGuideResponse(guide);
    }

    @Override
    @Transactional
    public AdminGuideResponse createGuide(GuideRequest request) {

        Guide guide = new Guide();

        if (request.getUserId() != null) {

            User user = userRepository.findById(request.getUserId())
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "User not found with id: " + request.getUserId()));

            guide.setUser(user);
        }

        guide.setName(request.getName());
        guide.setBio(request.getBio());
        guide.setPhotoUrl(request.getPhotoUrl());
        guide.setPhone(request.getPhone());
        guide.setEmail(request.getEmail());
        guide.setExperienceYears(
                request.getExperienceYears() == null
                        ? 0
                        : request.getExperienceYears()
        );

        guide.setLanguages(
                request.getLanguages() == null
                        ? new ArrayList<>()
                        : request.getLanguages()
        );

        guide.setCertifications(
                request.getCertifications() == null
                        ? new ArrayList<>()
                        : request.getCertifications()
        );

        guide.setSpecializations(
                request.getSpecializations() == null
                        ? new ArrayList<>()
                        : request.getSpecializations()
        );

        guide.setIsAvailable(
                request.getIsAvailable() == null
                        ? true
                        : request.getIsAvailable()
        );

        guide.setIsVerified(
                request.getIsVerified() == null
                        ? false
                        : request.getIsVerified()
        );

        Guide saved = guideRepository.save(guide);

        return toGuideResponse(saved);
    }

    @Override
    @Transactional
    public AdminGuideResponse updateGuide(Long guideId,GuideRequest request) {

        Guide guide = guideRepository.findById(guideId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Guide not found with id: " + guideId));

        if (request.getUserId() != null) {

            User user = userRepository.findById(request.getUserId())
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "User not found with id: " + request.getUserId()));

            guide.setUser(user);
        } else {
            guide.setUser(null);
        }

        guide.setName(request.getName());
        guide.setBio(request.getBio());
        guide.setPhotoUrl(request.getPhotoUrl());
        guide.setPhone(request.getPhone());
        guide.setEmail(request.getEmail());

        guide.setExperienceYears(
                request.getExperienceYears() == null
                        ? 0
                        : request.getExperienceYears()
        );

        guide.setLanguages(
                request.getLanguages() == null
                        ? new ArrayList<>()
                        : request.getLanguages()
        );

        guide.setCertifications(
                request.getCertifications() == null
                        ? new ArrayList<>()
                        : request.getCertifications()
        );

        guide.setSpecializations(
                request.getSpecializations() == null
                        ? new ArrayList<>()
                        : request.getSpecializations()
        );

        guide.setIsAvailable(
                request.getIsAvailable() == null
                        ? true
                        : request.getIsAvailable()
        );

        guide.setIsVerified(
                request.getIsVerified() == null
                        ? false
                        : request.getIsVerified()
        );

        Guide updated = guideRepository.save(guide);

        return toGuideResponse(updated);
    }

    @Override
    @Transactional
    public AdminGuideResponse verifyGuide(Long guideId) {

        Guide guide = guideRepository.findById(guideId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Guide not found with id: " + guideId));

        guide.setIsVerified(!guide.getIsVerified());

        Guide updated = guideRepository.save(guide);

        return toGuideResponse(updated);
    }

    @Override
    @Transactional
    public void deleteGuide(Long guideId) {

        Guide guide = guideRepository.findById(guideId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Guide not found with id: " + guideId));

        if (!guide.getBatches().isEmpty()) {
            throw new BadRequestException(
                    "Cannot delete guide because it is assigned to one or more batches."
            );
        }

        guideRepository.delete(guide);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<UserResponse> getAllUsers(String search, Pageable pageable) {

        Page<User> page;

        if (search == null || search.isBlank()) {
            page = userRepository.findAll(pageable);
        } else {
            page = userRepository
                    .findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
                            search,
                            search,
                            pageable
                    );
        }

        List<UserResponse> users = page.getContent()
                .stream()
                .map(this::toUserResponse)
                .toList();

        return PagedResponse.<UserResponse>builder()
                .content(users)
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .build();
    }

    @Override
    @Transactional
    public UserResponse toggleUserActive(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found with id: " + userId));

        user.setIsActive(!user.getIsActive());

        User updated = userRepository.save(user);

        return toUserResponse(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<AdminBookingResponse> getAllBookings(String status,String search,Pageable pageable) {

        Page<Booking> page;

        boolean hasStatus = status != null && !status.isBlank();
        boolean hasSearch = search != null && !search.isBlank();

        if (!hasStatus && !hasSearch) {

            page = bookingRepository.findAll(pageable);

        } else if (!hasStatus) {

            page = bookingRepository.findByBookingRefContainingIgnoreCase(
                    search,
                    pageable
            );

        } else if (!hasSearch) {

            page = bookingRepository.findByStatus(
                    BookingStatus.valueOf(status.toUpperCase()),
                    pageable
            );

        } else {

            page = bookingRepository.findByStatusAndBookingRefContainingIgnoreCase(
                    BookingStatus.valueOf(status.toUpperCase()),
                    search,
                    pageable
            );
        }

        List<AdminBookingResponse> bookings = page.getContent()
                .stream()
                .map(this::toAdminBookingResponse)
                .toList();

        return PagedResponse.<AdminBookingResponse>builder()
                .content(bookings)
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .build();
    }

    @Override
    @Transactional
    public AdminBookingResponse updateBookingStatus(String bookingRef,BookingStatus status) {

        Booking booking = bookingRepository.findByBookingRef(bookingRef)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Booking not found with reference: " + bookingRef));

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException(
                    "Cancelled booking cannot be updated."
            );
        }

        booking.setStatus(status);

        if (status == BookingStatus.CANCELLED) {

            Batch batch = booking.getBatch();

            int persons = booking.getNumAdults() + booking.getNumChildren();

            batch.setAvailableSlots(
                    batch.getAvailableSlots() + persons
            );

            booking.setCancelledAt(Instant.now());
        }

        Booking updated = bookingRepository.save(booking);

        return toAdminBookingResponse(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<AdminReviewResponse> getAllReviews(Boolean approved,Pageable pageable) {

        Page<Review> page;

        if (approved == null) {
            page = reviewRepository.findAll(pageable);
        } else {
            page = reviewRepository.findByIsApproved(
                    approved,
                    pageable
            );
        }

        List<AdminReviewResponse> reviews = page.getContent()
                .stream()
                .map(this::toAdminReviewResponse)
                .toList();

        return PagedResponse.<AdminReviewResponse>builder()
                .content(reviews)
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .build();
    }

    @Override
    @Transactional
    public AdminReviewResponse approveReview(Long reviewId) {

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Review not found with id: " + reviewId));

        review.setIsApproved(!review.getIsApproved());

        reviewRepository.save(review);

        recalculateTrekRating(review.getTrek());

        return toAdminReviewResponse(review);
    }

    @Override
    @Transactional
    public void deleteReview(Long reviewId) {

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Review not found with id: " + reviewId));

        Trek trek = review.getTrek();

        reviewRepository.delete(review);

        recalculateTrekRating(trek);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<AdminCouponResponse> getAllCoupons(Pageable pageable) {

        Page<Coupon> page = couponRepository.findAll(pageable);

        List<AdminCouponResponse> coupons = page.getContent()
                .stream()
                .map(this::toAdminCouponResponse)
                .toList();

        return PagedResponse.<AdminCouponResponse>builder()
                .content(coupons)
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .build();
    }

    @Override
    @Transactional
    public AdminCouponResponse createCoupon(AdminCouponRequest request) {

        if (couponRepository.findByCodeIgnoreCase(request.getCode()).isPresent()) {
            throw new BadRequestException(
                    "Coupon code already exists."
            );
        }

        if (request.getValidUntil().isBefore(request.getValidFrom())) {
            throw new BadRequestException(
                    "End date cannot be before start date."
            );
        }

        Coupon coupon = Coupon.builder()
                .code(request.getCode().trim().toUpperCase())
                .description(request.getDescription())
                .discountType(request.getDiscountType())
                .discountValue(request.getDiscountValue())
                .minAmount(request.getMinAmount())
                .maxDiscount(request.getMaxDiscount())
                .usageLimit(request.getUsageLimit())
                .usedCount(0)
                .validFrom(request.getValidFrom())
                .validUntil(request.getValidUntil())
                .isActive(true)
                .build();

        Coupon saved = couponRepository.save(coupon);

        return toAdminCouponResponse(saved);
    }

    @Override
    @Transactional
    public AdminCouponResponse toggleCoupon(Long couponId) {

        Coupon coupon = couponRepository.findById(couponId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Coupon not found with id: " + couponId));

        coupon.setIsActive(!coupon.getIsActive());

        Coupon updated = couponRepository.save(coupon);

        return toAdminCouponResponse(updated);
    }

    @Override
    @Transactional
    public void deleteCoupon(Long couponId) {

        Coupon coupon = couponRepository.findById(couponId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Coupon not found with id: " + couponId));

        if (coupon.getUsedCount() > 0) {
            throw new BadRequestException(
                    "Coupon cannot be deleted because it has already been used."
            );
        }

        couponRepository.delete(coupon);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CloudinaryFileResponse> getAllFiles() {
        return cloudinaryService.getAllFiles();
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getAllFolders() {
        return cloudinaryService.getAllFolders();
    }

    @Override
    @Transactional(readOnly = true)
    public List<CloudinaryFileResponse> getAllFiles(String folderName) {
        return cloudinaryService.getAllFiles(folderName);
    }



    private Trek buildTrek(AdminTrekRequest request) {

        return Trek.builder()
                .title(request.getTitle())
                .shortDescription(request.getShortDescription())
                .description(request.getDescription())
                .location(request.getLocation())
                .state(request.getState())
                .region(request.getRegion())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .altitudeMax(request.getAltitudeMax())
                .altitudeBase(request.getAltitudeBase())
                .durationDays(request.getDurationDays())
                .durationNights(request.getDurationNights())
                .difficulty(request.getDifficulty())
                .groupSizeMin(request.getGroupSizeMin())
                .groupSizeMax(request.getGroupSizeMax())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .meetingPoint(request.getMeetingPoint())
                .nearestAirport(request.getNearestAirport())
                .nearestRailway(request.getNearestRailway())
                .status(request.getStatus())
                .isFeatured(Boolean.TRUE.equals(request.getIsFeatured()))
                .isBestseller(Boolean.TRUE.equals(request.getIsBestseller()))
                .coverImageUrl(request.getCoverImageUrl())
                .metaTitle(request.getMetaTitle())
                .metaDescription(request.getMetaDescription())
                .highlights(request.getHighlights() == null ? new ArrayList<>() : request.getHighlights())
                .inclusions(request.getInclusions() == null ? new ArrayList<>() : request.getInclusions())
                .exclusions(request.getExclusions() == null ? new ArrayList<>() : request.getExclusions())
                .thingsToCarry(request.getThingsToCarry() == null ? new ArrayList<>() : request.getThingsToCarry())
                .build();
    }

    private void saveImages(Trek trek,List<TrekImageRequest> requests) {
        if (requests == null || requests.isEmpty()) {
            return;
        }

        for (TrekImageRequest request : requests) {

            TrekImage image = TrekImage.builder()
                    .trek(trek)
                    .imageUrl(request.getImageUrl())
                    .publicId(request.getPublicId())
                    .altText(request.getAltText())
                    .caption(request.getCaption())
                    .isCover(Boolean.TRUE.equals(request.getIsCover()))
                    .displayOrder(
                            request.getDisplayOrder() == null
                                    ? 0
                                    : request.getDisplayOrder()
                    )
                    .build();

            trek.getImages().add(image);
        }
    }

    private void saveItinerary(Trek trek,List<ItineraryRequest> requests) {

        if (requests == null || requests.isEmpty()) {
            return;
        }

        for (ItineraryRequest request : requests) {

            Itinerary itinerary = Itinerary.builder()
                    .trek(trek)
                    .dayNumber(request.getDayNumber())
                    .title(request.getTitle())
                    .description(request.getDescription())
                    .distanceKm(request.getDistanceKm())
                    .elevationGain(request.getElevationGain())
                    .elevationLoss(request.getElevationLoss())
                    .maxAltitude(request.getMaxAltitude())
                    .accommodation(request.getAccommodation())
                    .mealsIncluded(
                            request.getMealsIncluded() == null
                                    ? new ArrayList<>()
                                    : request.getMealsIncluded()
                    )
                    .difficultyDay(request.getDifficultyDay())
                    .tips(request.getTips())
                    .build();

            trek.getItinerary().add(itinerary);
        }
    }

    private void saveBatches(Trek trek,List<BatchRequest> requests) {

        if (requests == null || requests.isEmpty()) {
            return;
        }

        for (BatchRequest request : requests) {

            Batch batch = Batch.builder()
                    .trek(trek)
                    .startDate(request.getStartDate())
                    .endDate(request.getEndDate())
                    .totalSlots(request.getTotalSlots())
                    .availableSlots(request.getTotalSlots())
                    .pricePerPerson(request.getPricePerPerson())
                    .pricePerChild(request.getPricePerChild())
                    .meetingPoint(request.getMeetingPoint())
                    .status(
                            request.getStatus() == null
                                    ? BatchStatus.UPCOMING
                                    : request.getStatus()
                    )
                    .build();

            if (request.getGuideIds() != null && !request.getGuideIds().isEmpty()) {

                Set<Guide> guides = new HashSet<>(
                        guideRepository.findAllById(request.getGuideIds())
                );

                batch.setGuides(guides);
            }

            trek.getBatches().add(batch);
        }
    }

    private void updateTrekDetails(Trek trek, AdminTrekRequest request) {

        trek.setTitle(request.getTitle());

        trek.setShortDescription(request.getShortDescription());

        trek.setDescription(request.getDescription());

        trek.setLocation(request.getLocation());

        trek.setState(request.getState());

        trek.setRegion(request.getRegion());

        trek.setLatitude(request.getLatitude());

        trek.setLongitude(request.getLongitude());

        trek.setAltitudeMax(request.getAltitudeMax());

        trek.setAltitudeBase(request.getAltitudeBase());

        trek.setDurationDays(request.getDurationDays());

        trek.setDurationNights(request.getDurationNights());

        trek.setDifficulty(request.getDifficulty());

        trek.setGroupSizeMin(request.getGroupSizeMin());

        trek.setGroupSizeMax(request.getGroupSizeMax());

        trek.setStartDate(request.getStartDate());

        trek.setEndDate(request.getEndDate());

        trek.setMeetingPoint(request.getMeetingPoint());

        trek.setNearestAirport(request.getNearestAirport());

        trek.setNearestRailway(request.getNearestRailway());

        trek.setStatus(request.getStatus());

        trek.setIsFeatured(Boolean.TRUE.equals(request.getIsFeatured()));

        trek.setIsBestseller(Boolean.TRUE.equals(request.getIsBestseller()));

        trek.setCoverImageUrl(request.getCoverImageUrl());

        trek.setMetaTitle(request.getMetaTitle());

        trek.setMetaDescription(request.getMetaDescription());

        trek.setHighlights(
                request.getHighlights() == null
                        ? new ArrayList<>()
                        : request.getHighlights()
        );

        trek.setInclusions(
                request.getInclusions() == null
                        ? new ArrayList<>()
                        : request.getInclusions()
        );

        trek.setExclusions(
                request.getExclusions() == null
                        ? new ArrayList<>()
                        : request.getExclusions()
        );

        trek.setThingsToCarry(
                request.getThingsToCarry() == null
                        ? new ArrayList<>()
                        : request.getThingsToCarry()
        );
    }

    private void replaceImages(Trek trek,List<TrekImageRequest> requests) {

        trek.getImages().clear();

        saveImages(trek, requests);
    }

    private void replaceItinerary(Trek trek,List<ItineraryRequest> requests) {

        trek.getItinerary().clear();

        saveItinerary(trek, requests);
    }

    private void replaceBatches(Trek trek,List<BatchRequest> requests) {

        trek.getBatches().clear();

        saveBatches(trek, requests);
    }

    private TrekDetailResponse.ImageResponse toImageResponse(TrekImage image) {
        return TrekDetailResponse.ImageResponse.builder()
                .id(image.getId())
                .imageUrl(image.getImageUrl())
                .altText(image.getAltText())
                .caption(image.getCaption())
                .isCover(image.getIsCover())
                .displayOrder(image.getDisplayOrder())
                .build();
    }

    private TrekDetailResponse.ItineraryResponse toItineraryResponse(Itinerary itinerary) {
        return TrekDetailResponse.ItineraryResponse.builder()
                .id(itinerary.getId())
                .dayNumber(itinerary.getDayNumber())
                .title(itinerary.getTitle())
                .description(itinerary.getDescription())
                .distanceKm(itinerary.getDistanceKm())
                .elevationGain(itinerary.getElevationGain())
                .elevationLoss(itinerary.getElevationLoss())
                .maxAltitude(itinerary.getMaxAltitude())
                .accommodation(itinerary.getAccommodation())
                .mealsIncluded(itinerary.getMealsIncluded())
                .difficultyDay(itinerary.getDifficultyDay())
                .tips(itinerary.getTips())
                .build();
    }

    private TrekDetailResponse.BatchResponse toBatchResponse(Batch batch) {
        return TrekDetailResponse.BatchResponse.builder()
                .id(batch.getId())
                .startDate(batch.getStartDate())
                .endDate(batch.getEndDate())
                .totalSlots(batch.getTotalSlots())
                .availableSlots(batch.getAvailableSlots())
                .pricePerPerson(batch.getPricePerPerson())
                .pricePerChild(batch.getPricePerChild())
                .meetingPoint(batch.getMeetingPoint())
                .status(batch.getStatus())
                .build();
    }

    private AdminGuideResponse toGuideResponse(Guide guide) {
        return AdminGuideResponse.builder()
                .id(guide.getId())
                .userId(guide.getUser() != null ? guide.getUser().getId() : null)
                .name(guide.getName())
                .bio(guide.getBio())
                .photoUrl(guide.getPhotoUrl())
                .phone(guide.getPhone())
                .email(guide.getEmail())
                .experienceYears(guide.getExperienceYears())
                .languages(guide.getLanguages())
                .certifications(guide.getCertifications())
                .specializations(guide.getSpecializations())
                .avgRating(guide.getAvgRating())
                .totalTreks(guide.getTotalTreks())
                .isAvailable(guide.getIsAvailable())
                .isVerified(guide.getIsVerified())
                .createdAt(guide.getCreatedAt())
                .updatedAt(guide.getUpdatedAt())
                .build();
    }

    private UserResponse toUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .roles(user.getRoles())
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    private AdminBookingResponse toAdminBookingResponse(Booking booking) {

        return AdminBookingResponse.builder()
                .id(booking.getId())
                .bookingRef(booking.getBookingRef())
                .userId(booking.getUser().getId())
                .userName(booking.getUser().getName())
                .userEmail(booking.getUser().getEmail())
                .trekId(booking.getBatch().getTrek().getId())
                .trekTitle(booking.getBatch().getTrek().getTitle())
                .batchId(booking.getBatch().getId())
                .startDate(booking.getBatch().getStartDate())
                .endDate(booking.getBatch().getEndDate())
                .persons(booking.getPerson())
                .amount(BigDecimal.valueOf(booking.getTotalAmount()))
                .paymentStatus(booking.getPaymentStatus())
                .bookingStatus(booking.getStatus())
                .createdAt(booking.getCreatedAt())
                .updatedAt(booking.getUpdatedAt())
                .build();
    }

    private AdminReviewResponse toAdminReviewResponse(Review review) {

        return AdminReviewResponse.builder()
                .id(review.getId())
                .trekId(review.getTrek().getId())
                .trekTitle(review.getTrek().getTitle())
                .userId(review.getUser().getId())
                .userName(review.getUser().getName())
                .userPhoto(review.getUser().getAvatarUrl())
                .rating(review.getRating())
                .title(review.getTitle())
                .body(review.getBody())
                .photos(review.getPhotos())
                .isVerified(review.getIsVerified())
                .isApproved(review.getIsApproved())
                .helpfulCount(review.getHelpfulCount())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .build();
    }

    private void recalculateTrekRating(Trek trek) {

        List<Review> approvedReviews = reviewRepository
                .findAllByTrekAndIsApprovedTrue(trek);

        trek.setTotalReviews(approvedReviews.size());

        if (approvedReviews.isEmpty()) {

            trek.setAvgRating(BigDecimal.ZERO);

        } else {

            double average = approvedReviews.stream()
                    .mapToInt(Review::getRating)
                    .average()
                    .orElse(0);

            trek.setAvgRating(
                    BigDecimal.valueOf(average)
                            .setScale(2, RoundingMode.HALF_UP)
            );
        }

        trekRepository.save(trek);
    }

    private AdminCouponResponse toAdminCouponResponse(Coupon coupon) {

        return AdminCouponResponse.builder()
                .id(coupon.getId())
                .code(coupon.getCode())
                .description(coupon.getDescription())
                .discountType(coupon.getDiscountType())
                .discountValue(coupon.getDiscountValue())
                .minAmount(coupon.getMinAmount())
                .maxDiscount(coupon.getMaxDiscount())
                .usageLimit(coupon.getUsageLimit())
                .usedCount(coupon.getUsedCount())
//                .startDate(coupon.getStartDate())
//                .endDate(coupon.getEndDate())
                .isActive(coupon.getIsActive())
                .createdAt(coupon.getCreatedAt())
                .updatedAt(coupon.getUpdatedAt())
                .build();
    }

    private TrekResponse toTrekResponse(Trek trek) {

        return TrekResponse.builder()
                .id(trek.getId())
                .title(trek.getTitle())
                .slug(trek.getSlug())
                .shortDescription(trek.getShortDescription())
                .location(trek.getLocation())
                .state(trek.getState())
                .region(trek.getRegion())
                .altitudeMax(trek.getAltitudeMax())
                .altitudeBase(trek.getAltitudeBase())
                .durationDays(trek.getDurationDays())
                .durationNights(trek.getDurationNights())
                .difficulty(trek.getDifficulty())
                .pricePerPerson(
                        trek.getBatches().stream()
                                .map(Batch::getPricePerPerson)
                                .min(BigDecimal::compareTo)
                                .orElse(BigDecimal.ZERO)
                )
//                .priceChild(trek.getPriceChild())
                .groupSizeMin(trek.getGroupSizeMin())
                .groupSizeMax(trek.getGroupSizeMax())
                .startDate(trek.getStartDate())
                .endDate(trek.getEndDate())
                .meetingPoint(trek.getMeetingPoint())
                .nearestAirport(trek.getNearestAirport())
                .nearestRailway(trek.getNearestRailway())
                .status(trek.getStatus())
                .isFeatured(trek.getIsFeatured())
                .isBestseller(trek.getIsBestseller())
                .avgRating(trek.getAvgRating())
                .totalReviews(trek.getTotalReviews())
                .totalBookings(trek.getTotalBookings())
                .coverImageUrl(trek.getCoverImageUrl())
                .metaTitle(trek.getMetaTitle())
                .metaDescription(trek.getMetaDescription())
                .highlights(trek.getHighlights())
                .createdAt(trek.getCreatedAt())
                .updatedAt(trek.getUpdatedAt())
                .build();
    }

    private String generateUniqueSlug(String title) {

        String baseSlug = toSlug(title);

        String slug = baseSlug;

        int counter = 1;

        while (trekRepository.existsBySlug(slug)) {
            slug = baseSlug + "-" + counter++;
        }

        return slug;
    }

    private String toSlug(String title) {

        return title
                .toLowerCase()
                .trim()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-");
    }

}
