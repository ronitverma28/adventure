package com.adventure.repository;

import com.adventure.entity.DiscussionReply;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DiscussionReplyRepository extends JpaRepository<DiscussionReply, Long> {
    Page<DiscussionReply> findByDiscussionIdOrderByCreatedAtAsc(Long discussionId, Pageable pageable);
}
