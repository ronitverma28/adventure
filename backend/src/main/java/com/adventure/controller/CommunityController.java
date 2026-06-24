package com.adventure.controller;

import com.adventure.dto.request.*;
import com.adventure.dto.response.*;
import com.adventure.service.interfaces.CommunityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/community")
@RequiredArgsConstructor
@Tag(name = "Community", description = "Community feed, posts, discussions, follows")
public class CommunityController {

    private final CommunityService communityService;

    // ── Feed (public GET) ──────────────────────────────────────────────────────

    @GetMapping("/feed")
    @Operation(summary = "Get community feed")
    public ResponseEntity<ApiResponse<PagedResponse<CommunityPostResponse>>> getFeed(
        @RequestParam(required = false) String type,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "12") int size,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        String email = userDetails != null ? userDetails.getUsername() : null;
        return ResponseEntity.ok(ApiResponse.success(communityService.getFeed(type, email, pageable)));
    }

    @GetMapping("/posts/{postId}")
    @Operation(summary = "Get single post")
    public ResponseEntity<ApiResponse<CommunityPostResponse>> getPost(
        @PathVariable Long postId,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        String email = userDetails != null ? userDetails.getUsername() : null;
        return ResponseEntity.ok(ApiResponse.success(communityService.getPost(postId, email)));
    }

    @PostMapping("/posts")
    @PreAuthorize("isAuthenticated()")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Create post")
    public ResponseEntity<ApiResponse<CommunityPostResponse>> createPost(
        @AuthenticationPrincipal UserDetails userDetails,
        @Valid @RequestBody CreatePostRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Post created",
                communityService.createPost(userDetails.getUsername(), request)));
    }

    @DeleteMapping("/posts/{postId}")
    @PreAuthorize("isAuthenticated()")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Delete post")
    public ResponseEntity<ApiResponse<Void>> deletePost(
        @AuthenticationPrincipal UserDetails userDetails,
        @PathVariable Long postId
    ) {
        communityService.deletePost(userDetails.getUsername(), postId);
        return ResponseEntity.ok(ApiResponse.success("Post deleted", null));
    }

    // ── Likes ───────────────────────────────────────────────────────────────────

    @PostMapping("/posts/{postId}/like")
    @PreAuthorize("isAuthenticated()")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Toggle like on post")
    public ResponseEntity<ApiResponse<CommunityPostResponse>> toggleLike(
        @AuthenticationPrincipal UserDetails userDetails,
        @PathVariable Long postId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
            communityService.toggleLike(userDetails.getUsername(), postId)));
    }

    // ── Comments ───────────────────────────────────────────────────────────────

    @GetMapping("/posts/{postId}/comments")
    @Operation(summary = "Get comments for a post")
    public ResponseEntity<ApiResponse<PagedResponse<CommunityCommentResponse>>> getComments(
        @PathVariable Long postId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(ApiResponse.success(communityService.getComments(postId, pageable)));
    }

    @PostMapping("/posts/{postId}/comments")
    @PreAuthorize("isAuthenticated()")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Add comment")
    public ResponseEntity<ApiResponse<CommunityCommentResponse>> addComment(
        @AuthenticationPrincipal UserDetails userDetails,
        @PathVariable Long postId,
        @Valid @RequestBody CreateCommentRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(communityService.addComment(userDetails.getUsername(), postId, request)));
    }

    @DeleteMapping("/comments/{commentId}")
    @PreAuthorize("isAuthenticated()")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Delete comment")
    public ResponseEntity<ApiResponse<Void>> deleteComment(
        @AuthenticationPrincipal UserDetails userDetails,
        @PathVariable Long commentId
    ) {
        communityService.deleteComment(userDetails.getUsername(), commentId);
        return ResponseEntity.ok(ApiResponse.success("Comment deleted", null));
    }

    // ── Follow / Members ─────────────────────────────────────────────────────

    @PostMapping("/users/{userId}/follow")
    @PreAuthorize("isAuthenticated()")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Toggle follow user")
    public ResponseEntity<ApiResponse<CommunityProfileResponse>> toggleFollow(
        @AuthenticationPrincipal UserDetails userDetails,
        @PathVariable Long userId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
            communityService.toggleFollow(userDetails.getUsername(), userId)));
    }

    @GetMapping("/users/{userId}/profile")
    @Operation(summary = "Get community profile")
    public ResponseEntity<ApiResponse<CommunityProfileResponse>> getProfile(
        @PathVariable Long userId,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        String email = userDetails != null ? userDetails.getUsername() : null;
        return ResponseEntity.ok(ApiResponse.success(communityService.getProfile(userId, email)));
    }

    @GetMapping("/members")
    @Operation(summary = "Get community members")
    public ResponseEntity<ApiResponse<PagedResponse<CommunityProfileResponse>>> getMembers(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        String email = userDetails != null ? userDetails.getUsername() : null;
        return ResponseEntity.ok(ApiResponse.success(communityService.getMembers(email, pageable)));
    }

    // ── Discussions ────────────────────────────────────────────────────────────

    @GetMapping("/discussions")
    @Operation(summary = "List discussions")
    public ResponseEntity<ApiResponse<PagedResponse<DiscussionResponse>>> getDiscussions(
        @RequestParam(required = false) String category,
        @RequestParam(required = false) String search,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "15") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(ApiResponse.success(
            communityService.getDiscussions(category, search, pageable)));
    }

    @GetMapping("/discussions/{discussionId}")
    @Operation(summary = "Get discussion")
    public ResponseEntity<ApiResponse<DiscussionResponse>> getDiscussion(
        @PathVariable Long discussionId
    ) {
        return ResponseEntity.ok(ApiResponse.success(communityService.getDiscussion(discussionId)));
    }

    @PostMapping("/discussions")
    @PreAuthorize("isAuthenticated()")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Create discussion")
    public ResponseEntity<ApiResponse<DiscussionResponse>> createDiscussion(
        @AuthenticationPrincipal UserDetails userDetails,
        @Valid @RequestBody CreateDiscussionRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Discussion created",
                communityService.createDiscussion(userDetails.getUsername(), request)));
    }

    @DeleteMapping("/discussions/{discussionId}")
    @PreAuthorize("isAuthenticated()")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Delete discussion")
    public ResponseEntity<ApiResponse<Void>> deleteDiscussion(
        @AuthenticationPrincipal UserDetails userDetails,
        @PathVariable Long discussionId
    ) {
        communityService.deleteDiscussion(userDetails.getUsername(), discussionId);
        return ResponseEntity.ok(ApiResponse.success("Discussion deleted", null));
    }

    // ── Replies ─────────────────────────────────────────────────────────────────

    @GetMapping("/discussions/{discussionId}/replies")
    @Operation(summary = "Get replies")
    public ResponseEntity<ApiResponse<PagedResponse<DiscussionReplyResponse>>> getReplies(
        @PathVariable Long discussionId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(ApiResponse.success(communityService.getReplies(discussionId, pageable)));
    }

    @PostMapping("/discussions/{discussionId}/replies")
    @PreAuthorize("isAuthenticated()")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Add reply")
    public ResponseEntity<ApiResponse<DiscussionReplyResponse>> addReply(
        @AuthenticationPrincipal UserDetails userDetails,
        @PathVariable Long discussionId,
        @Valid @RequestBody CreateReplyRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(communityService.addReply(userDetails.getUsername(), discussionId, request)));
    }

    @PatchMapping("/replies/{replyId}/accept")
    @PreAuthorize("isAuthenticated()")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Accept reply as answer")
    public ResponseEntity<ApiResponse<DiscussionReplyResponse>> acceptReply(
        @AuthenticationPrincipal UserDetails userDetails,
        @PathVariable Long replyId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
            communityService.acceptReply(userDetails.getUsername(), replyId)));
    }

    @DeleteMapping("/replies/{replyId}")
    @PreAuthorize("isAuthenticated()")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Delete reply")
    public ResponseEntity<ApiResponse<Void>> deleteReply(
        @AuthenticationPrincipal UserDetails userDetails,
        @PathVariable Long replyId
    ) {
        communityService.deleteReply(userDetails.getUsername(), replyId);
        return ResponseEntity.ok(ApiResponse.success("Reply deleted", null));
    }
}
