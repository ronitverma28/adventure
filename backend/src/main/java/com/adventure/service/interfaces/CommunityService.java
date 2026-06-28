package com.adventure.service.interfaces;

import com.adventure.dto.request.*;
import com.adventure.dto.response.*;
import org.springframework.data.domain.Pageable;

public interface CommunityService {
    // Feed
    PagedResponse<CommunityPostResponse> getFeed(String type, String viewerEmail, Pageable pageable);
    CommunityPostResponse getPost(Long postId, String viewerEmail);
    CommunityPostResponse createPost(String userEmail, CreatePostRequest request);
    void deletePost(String userEmail, Long postId);

    // Likes
    CommunityPostResponse toggleLike(String userEmail, Long postId);

    // Comments
    PagedResponse<CommunityCommentResponse> getComments(Long postId, Pageable pageable);
    CommunityCommentResponse addComment(String userEmail, Long postId, CreateCommentRequest request);
    void deleteComment(String userEmail, Long commentId);

    // Follow
    CommunityProfileResponse toggleFollow(String followerEmail, Long targetUserId);
    CommunityProfileResponse getProfile(Long userId, String viewerEmail);
    PagedResponse<CommunityProfileResponse> getMembers(String viewerEmail, Pageable pageable);

    // Discussions
    PagedResponse<DiscussionResponse> getDiscussions(String category, String search, Pageable pageable);
    DiscussionResponse getDiscussion(Long discussionId);
    DiscussionResponse createDiscussion(String userEmail, CreateDiscussionRequest request);
    void deleteDiscussion(String userEmail, Long discussionId);

    // Replies
    PagedResponse<DiscussionReplyResponse> getReplies(Long discussionId, Pageable pageable);
    DiscussionReplyResponse addReply(String userEmail, Long discussionId, CreateReplyRequest request);
    DiscussionReplyResponse acceptReply(String userEmail, Long replyId);
    void deleteReply(String userEmail, Long replyId);
}
