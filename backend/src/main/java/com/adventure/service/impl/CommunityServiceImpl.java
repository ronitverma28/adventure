package com.adventure.service.impl;

import com.adventure.dto.request.*;
import com.adventure.dto.response.*;
import com.adventure.entity.*;
import com.adventure.exception.BadRequestException;
import com.adventure.exception.ResourceNotFoundException;
import com.adventure.exception.UnauthorizedException;
import com.adventure.repository.*;
import com.adventure.service.interfaces.CommunityService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CommunityServiceImpl implements CommunityService {

    private final CommunityPostRepository postRepository;
    private final CommunityCommentRepository commentRepository;
    private final CommunityLikeRepository likeRepository;
    private final UserFollowRepository followRepository;
    private final DiscussionRepository discussionRepository;
    private final DiscussionReplyRepository replyRepository;
    private final UserRepository userRepository;
    private final TrekRepository trekRepository;

    // ── Feed ────────────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<CommunityPostResponse> getFeed(String type, String viewerEmail, Pageable pageable) {
        User viewer = viewerEmail != null ? userRepository.findByEmail(viewerEmail).orElse(null) : null;
        String typeFilter = StringUtils.hasText(type) ? type.toUpperCase() : null;
        Page<CommunityPost> page = postRepository.findFeed(typeFilter, pageable);
        return toPagedResponse(page.map(p -> toPostResponse(p, viewer)));
    }

    @Override
    @Transactional(readOnly = true)
    public CommunityPostResponse getPost(Long postId, String viewerEmail) {
        CommunityPost post = findPost(postId);
        User viewer = viewerEmail != null ? userRepository.findByEmail(viewerEmail).orElse(null) : null;
        return toPostResponse(post, viewer);
    }

    @Override
    public CommunityPostResponse createPost(String userEmail, CreatePostRequest request) {
        User user = findUser(userEmail);
        Trek trek = request.getTrekId() != null
            ? trekRepository.findById(request.getTrekId()).orElse(null)
            : null;
        String imageUrlsStr = request.getImageUrls() != null
            ? String.join(",", request.getImageUrls())
            : null;
        CommunityPost post = CommunityPost.builder()
            .author(user)
            .trek(trek)
            .title(request.getTitle())
            .content(request.getContent())
            .type(request.getType() != null ? request.getType().toUpperCase() : "EXPERIENCE")
            .imageUrls(imageUrlsStr)
            .build();
        return toPostResponse(postRepository.save(post), user);
    }

    @Override
    public void deletePost(String userEmail, Long postId) {
        User user = findUser(userEmail);
        CommunityPost post = findPost(postId);
        if (!post.getAuthor().getId().equals(user.getId())) {
            throw new UnauthorizedException("You can only delete your own posts");
        }
        postRepository.delete(post);
    }

    // ── Likes ──────────────────────────────────────────────────────────────────

    @Override
    public CommunityPostResponse toggleLike(String userEmail, Long postId) {
        User user = findUser(userEmail);
        CommunityPost post = findPost(postId);
        likeRepository.findByPostIdAndUserId(postId, user.getId()).ifPresentOrElse(
            like -> {
                likeRepository.delete(like);
                post.setLikeCount(Math.max(0, post.getLikeCount() - 1));
            },
            () -> {
                likeRepository.save(CommunityLike.builder().post(post).user(user).build());
                post.setLikeCount(post.getLikeCount() + 1);
            }
        );
        return toPostResponse(postRepository.save(post), user);
    }

    // ── Comments ───────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<CommunityCommentResponse> getComments(Long postId, Pageable pageable) {
        Page<CommunityComment> page = commentRepository.findByPostIdOrderByCreatedAtAsc(postId, pageable);
        return toPagedResponse(page.map(this::toCommentResponse));
    }

    @Override
    public CommunityCommentResponse addComment(String userEmail, Long postId, CreateCommentRequest request) {
        User user = findUser(userEmail);
        CommunityPost post = findPost(postId);
        CommunityComment comment = CommunityComment.builder()
            .post(post)
            .author(user)
            .content(request.getContent())
            .build();
        post.setCommentCount(post.getCommentCount() + 1);
        postRepository.save(post);
        return toCommentResponse(commentRepository.save(comment));
    }

    @Override
    public void deleteComment(String userEmail, Long commentId) {
        User user = findUser(userEmail);
        CommunityComment comment = commentRepository.findById(commentId)
            .orElseThrow(() -> new ResourceNotFoundException("Comment", commentId));
        if (!comment.getAuthor().getId().equals(user.getId())) {
            throw new UnauthorizedException("You can only delete your own comments");
        }
        CommunityPost post = comment.getPost();
        post.setCommentCount(Math.max(0, post.getCommentCount() - 1));
        postRepository.save(post);
        commentRepository.delete(comment);
    }

    // ── Follow ─────────────────────────────────────────────────────────────────

    @Override
    public CommunityProfileResponse toggleFollow(String followerEmail, Long targetUserId) {
        User follower = findUser(followerEmail);
        if (follower.getId().equals(targetUserId)) {
            throw new BadRequestException("You cannot follow yourself");
        }
        User target = userRepository.findById(targetUserId)
            .orElseThrow(() -> new ResourceNotFoundException("User", targetUserId));
        followRepository.findByFollowerIdAndFollowingId(follower.getId(), targetUserId).ifPresentOrElse(
            followRepository::delete,
            () -> followRepository.save(UserFollow.builder().follower(follower).following(target).build())
        );
        return toProfileResponse(target, follower);
    }

    @Override
    @Transactional(readOnly = true)
    public CommunityProfileResponse getProfile(Long userId, String viewerEmail) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        User viewer = viewerEmail != null ? userRepository.findByEmail(viewerEmail).orElse(null) : null;
        return toProfileResponse(user, viewer);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<CommunityProfileResponse> getMembers(String viewerEmail, Pageable pageable) {
        User viewer = viewerEmail != null ? userRepository.findByEmail(viewerEmail).orElse(null) : null;
        Page<User> page = userRepository.findAll(pageable);
        return toPagedResponse(page.map(u -> toProfileResponse(u, viewer)));
    }

    // ── Discussions ────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<DiscussionResponse> getDiscussions(String category, String search, Pageable pageable) {
        String cat = StringUtils.hasText(category) ? category.toUpperCase() : null;
        String srch = StringUtils.hasText(search) ? search : null;
        Page<Discussion> page = discussionRepository.findAll(cat, srch, pageable);
        return toPagedResponse(page.map(this::toDiscussionResponse));
    }

    @Override
    @Transactional
    public DiscussionResponse getDiscussion(Long discussionId) {
        Discussion d = findDiscussion(discussionId);
        d.setViewCount(d.getViewCount() + 1);
        return toDiscussionResponse(discussionRepository.save(d));
    }

    @Override
    public DiscussionResponse createDiscussion(String userEmail, CreateDiscussionRequest request) {
        User user = findUser(userEmail);
        Trek trek = request.getTrekId() != null
            ? trekRepository.findById(request.getTrekId()).orElse(null)
            : null;
        Discussion discussion = Discussion.builder()
            .author(user)
            .trek(trek)
            .title(request.getTitle())
            .body(request.getBody())
            .category(request.getCategory() != null ? request.getCategory().toUpperCase() : "GENERAL")
            .build();
        return toDiscussionResponse(discussionRepository.save(discussion));
    }

    @Override
    public void deleteDiscussion(String userEmail, Long discussionId) {
        User user = findUser(userEmail);
        Discussion d = findDiscussion(discussionId);
        if (!d.getAuthor().getId().equals(user.getId())) {
            throw new UnauthorizedException("You can only delete your own discussions");
        }
        discussionRepository.delete(d);
    }

    // ── Replies ────────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<DiscussionReplyResponse> getReplies(Long discussionId, Pageable pageable) {
        Page<DiscussionReply> page = replyRepository.findByDiscussionIdOrderByCreatedAtAsc(discussionId, pageable);
        return toPagedResponse(page.map(this::toReplyResponse));
    }

    @Override
    public DiscussionReplyResponse addReply(String userEmail, Long discussionId, CreateReplyRequest request) {
        User user = findUser(userEmail);
        Discussion discussion = findDiscussion(discussionId);
        DiscussionReply reply = DiscussionReply.builder()
            .discussion(discussion)
            .author(user)
            .content(request.getContent())
            .build();
        discussion.setReplyCount(discussion.getReplyCount() + 1);
        discussionRepository.save(discussion);
        return toReplyResponse(replyRepository.save(reply));
    }

    @Override
    public DiscussionReplyResponse acceptReply(String userEmail, Long replyId) {
        User user = findUser(userEmail);
        DiscussionReply reply = replyRepository.findById(replyId)
            .orElseThrow(() -> new ResourceNotFoundException("Reply", replyId));
        if (!reply.getDiscussion().getAuthor().getId().equals(user.getId())) {
            throw new UnauthorizedException("Only the discussion author can accept a reply");
        }
        reply.setIsAccepted(!Boolean.TRUE.equals(reply.getIsAccepted()));
        reply.getDiscussion().setIsResolved(reply.getIsAccepted());
        return toReplyResponse(replyRepository.save(reply));
    }

    @Override
    public void deleteReply(String userEmail, Long replyId) {
        User user = findUser(userEmail);
        DiscussionReply reply = replyRepository.findById(replyId)
            .orElseThrow(() -> new ResourceNotFoundException("Reply", replyId));
        if (!reply.getAuthor().getId().equals(user.getId())) {
            throw new UnauthorizedException("You can only delete your own replies");
        }
        Discussion d = reply.getDiscussion();
        d.setReplyCount(Math.max(0, d.getReplyCount() - 1));
        discussionRepository.save(d);
        replyRepository.delete(reply);
    }

    // ── Helpers ─────────────────────────────────────────────────────────────────

    private User findUser(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }

    private CommunityPost findPost(Long id) {
        return postRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Post", id));
    }

    private Discussion findDiscussion(Long id) {
        return discussionRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Discussion", id));
    }

    private CommunityPostResponse.AuthorInfo toAuthorInfo(User u) {
        return CommunityPostResponse.AuthorInfo.builder()
            .id(u.getId())
            .name(u.getName())
            .avatarUrl(u.getAvatarUrl())
            .followerCount(followRepository.countByFollowingId(u.getId()))
            .postCount(postRepository.countByAuthorId(u.getId()))
            .build();
    }

    private CommunityPostResponse toPostResponse(CommunityPost p, User viewer) {
        List<String> images = p.getImageUrls() != null && !p.getImageUrls().isBlank()
            ? Arrays.asList(p.getImageUrls().split(","))
            : List.of();
        boolean liked = viewer != null && likeRepository.existsByPostIdAndUserId(p.getId(), viewer.getId());
        return CommunityPostResponse.builder()
            .id(p.getId())
            .author(toAuthorInfo(p.getAuthor()))
            .trekTitle(p.getTrek() != null ? p.getTrek().getTitle() : null)
            .trekSlug(p.getTrek() != null ? p.getTrek().getSlug() : null)
            .title(p.getTitle())
            .content(p.getContent())
            .imageUrls(images)
            .type(p.getType())
            .likeCount(p.getLikeCount())
            .commentCount(p.getCommentCount())
            .likedByMe(liked)
            .createdAt(p.getCreatedAt())
            .updatedAt(p.getUpdatedAt())
            .build();
    }

    private CommunityCommentResponse toCommentResponse(CommunityComment c) {
        return CommunityCommentResponse.builder()
            .id(c.getId())
            .postId(c.getPost().getId())
            .author(toAuthorInfo(c.getAuthor()))
            .content(c.getContent())
            .likeCount(c.getLikeCount())
            .createdAt(c.getCreatedAt())
            .build();
    }

    private CommunityProfileResponse toProfileResponse(User u, User viewer) {
        boolean followed = viewer != null
            && followRepository.existsByFollowerIdAndFollowingId(viewer.getId(), u.getId());
        return CommunityProfileResponse.builder()
            .id(u.getId())
            .name(u.getName())
            .avatarUrl(u.getAvatarUrl())
            .city(u.getCity())
            .state(u.getState())
            .followerCount(followRepository.countByFollowingId(u.getId()))
            .followingCount(followRepository.countByFollowerId(u.getId()))
            .postCount(postRepository.countByAuthorId(u.getId()))
            .followedByMe(followed)
            .build();
    }

    private DiscussionResponse toDiscussionResponse(Discussion d) {
        return DiscussionResponse.builder()
            .id(d.getId())
            .author(toAuthorInfo(d.getAuthor()))
            .trekTitle(d.getTrek() != null ? d.getTrek().getTitle() : null)
            .trekSlug(d.getTrek() != null ? d.getTrek().getSlug() : null)
            .title(d.getTitle())
            .body(d.getBody())
            .category(d.getCategory())
            .replyCount(d.getReplyCount())
            .viewCount(d.getViewCount())
            .isResolved(d.getIsResolved())
            .isPinned(d.getIsPinned())
            .createdAt(d.getCreatedAt())
            .build();
    }

    private DiscussionReplyResponse toReplyResponse(DiscussionReply r) {
        return DiscussionReplyResponse.builder()
            .id(r.getId())
            .discussionId(r.getDiscussion().getId())
            .author(toAuthorInfo(r.getAuthor()))
            .content(r.getContent())
            .isAccepted(r.getIsAccepted())
            .likeCount(r.getLikeCount())
            .createdAt(r.getCreatedAt())
            .build();
    }

    private <T> PagedResponse<T> toPagedResponse(Page<T> page) {
        return PagedResponse.<T>builder()
            .content(page.getContent())
            .page(page.getNumber()).size(page.getSize())
            .totalElements(page.getTotalElements()).totalPages(page.getTotalPages())
            .first(page.isFirst()).last(page.isLast())
            .build();
    }
}
