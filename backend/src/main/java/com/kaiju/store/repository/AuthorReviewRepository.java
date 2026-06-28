package com.kaiju.store.repository;

import com.kaiju.store.model.AuthorReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuthorReviewRepository extends JpaRepository<AuthorReview, Long> {
}
