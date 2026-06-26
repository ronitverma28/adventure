package com.adventure.specification;

import com.adventure.dto.request.TrekFilterRequest;
import com.adventure.entity.Trek;
import com.adventure.enums.TrekStatus;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

public final class TrekSpecification {

    private TrekSpecification() {
    }

    public static Specification<Trek> publicFilters(TrekFilterRequest filter) {
        return (root, query, cb) -> {
            var predicate = cb.equal(root.get("status"), TrekStatus.ACTIVE);

            if (filter == null) {
                return predicate;
            }
            if (StringUtils.hasText(filter.getSearch())) {
                String value = "%" + filter.getSearch().trim().toLowerCase() + "%";
                predicate = cb.and(predicate, cb.or(
                    cb.like(cb.lower(root.get("title")), value),
                    cb.like(cb.lower(root.get("shortDescription")), value),
                    cb.like(cb.lower(root.get("location")), value),
                    cb.like(cb.lower(root.get("state")), value),
                    cb.like(cb.lower(root.get("region")), value)
                ));
            }
            if (filter.getDifficulty() != null) {
                predicate = cb.and(predicate, cb.equal(root.get("difficulty"), filter.getDifficulty()));
            }
            if (StringUtils.hasText(filter.getState())) {
                predicate = cb.and(predicate, cb.equal(cb.lower(root.get("state")), filter.getState().trim().toLowerCase()));
            }
            if (StringUtils.hasText(filter.getRegion())) {
                predicate = cb.and(predicate, cb.equal(cb.lower(root.get("region")), filter.getRegion().trim().toLowerCase()));
            }
            if (filter.getMinPrice() != null) {
                predicate = cb.and(predicate, cb.greaterThanOrEqualTo(root.get("pricePerPerson"), filter.getMinPrice()));
            }
            if (filter.getMaxPrice() != null) {
                predicate = cb.and(predicate, cb.lessThanOrEqualTo(root.get("pricePerPerson"), filter.getMaxPrice()));
            }
            if (filter.getFeatured() != null) {
                predicate = cb.and(predicate, cb.equal(root.get("isFeatured"), filter.getFeatured()));
            }
            if (filter.getBestseller() != null) {
                predicate = cb.and(predicate, cb.equal(root.get("isBestseller"), filter.getBestseller()));
            }

            return predicate;
        };
    }
}
