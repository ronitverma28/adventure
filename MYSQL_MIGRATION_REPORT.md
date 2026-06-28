# MySQL Migration Report

Date: 2026-06-25

Scope: backend entity mappings, backend persistence configuration, dependency cleanup, and mapper glue needed to preserve existing DTO/API contracts.

## Verification

- Ran `.\mvnw.cmd clean install` from `backend/`.
- Result: build succeeded.
- Test status: no test sources were present, so Maven reported `No tests to run`.
- Re-scanned entity/config/pom files for PostgreSQL-only mappings:
  - `TEXT[]`
  - `jsonb`
  - `VARCHAR[]`
  - `UUID`
  - `INET`
  - PostgreSQL dialect/dependency references
- Result: no PostgreSQL-only mappings remain in the checked backend targets.

## Files Modified

- `backend/src/main/java/com/adventure/entity/Trek.java`
- `backend/src/main/java/com/adventure/entity/Guide.java`
- `backend/src/main/java/com/adventure/entity/Review.java`
- `backend/src/main/java/com/adventure/entity/Itinerary.java`
- `backend/src/main/java/com/adventure/entity/Payment.java`
- `backend/src/main/java/com/adventure/service/impl/AdminServiceImpl.java`
- `backend/src/main/resources/application.properties`
- `backend/pom.xml`
- `MYSQL_MIGRATION_REPORT.md`

## Array Columns Updated

Replaced PostgreSQL `TEXT[]` entity mappings with MySQL-compatible `@ElementCollection` tables.

### `Trek`

- `highlights`: `String[]` on `TEXT[]` -> `List<String>` in `trek_highlights`
- `inclusions`: `String[]` on `TEXT[]` -> `List<String>` in `trek_inclusions`
- `exclusions`: `String[]` on `TEXT[]` -> `List<String>` in `trek_exclusions`
- `thingsToCarry`: `String[]` on `TEXT[]` -> `List<String>` in `trek_things_to_carry`

Each collection uses:

- `@ElementCollection(fetch = FetchType.LAZY)`
- `@CollectionTable(..., joinColumns = @JoinColumn(name = "trek_id"))`
- `@OrderColumn(name = "sort_order")`
- `@Column(name = "value", columnDefinition = "TEXT")`

### `Guide`

- `languages`: `String[]` on `TEXT[]` -> `List<String>` in `guide_languages`
- `certifications`: `String[]` on `TEXT[]` -> `List<String>` in `guide_certifications`
- `specializations`: `String[]` on `TEXT[]` -> `List<String>` in `guide_specializations`

### `Review`

- `photos`: `String[]` on `TEXT[]` -> `List<String>` in `review_photos`

### `Itinerary`

- `mealsIncluded`: `String[]` on `TEXT[]` -> `List<String>` in `itinerary_meals_included`

## JSON Columns Updated

### `Payment`

- `metadata`: `@Column(columnDefinition = "jsonb")` -> `@Column(columnDefinition = "JSON")`
- Kept `@JdbcTypeCode(SqlTypes.JSON)`, which is supported by Hibernate 6 with MySQL 8 JSON columns.

## DTO/API Compatibility

No API endpoints were renamed.

No DTO fields were changed.

`AdminServiceImpl` now converts between the existing DTO `String[]` fields and the entity `List<String>` collections:

- Request DTO array -> mutable entity list
- Entity list -> response DTO array

This preserves the existing controller and DTO contract while making persistence MySQL-safe.

## Duplicate Columns Fixed

No duplicate mappings were introduced or found for `created_at`, `updated_at`, `created_by`, `updated_by`, `user_id`, `booking_id`, or `trek_id`.

Notes:

- `BaseEntity` owns `created_at`, `updated_at`, `created_by`, and `updated_by` for entities that extend it.
- Entities that do not extend `BaseEntity` and define `created_at` directly, such as `Wishlist`, `UserFollow`, and `CommunityLike`, remain valid because there is no inherited duplicate.

## Relationship Review

Relationship annotations were reviewed across the entity package.

No endpoint or business workflow changes were made.

Existing relationship patterns were preserved:

- Lazy `@ManyToOne` relationships remain lazy.
- Existing `@OneToMany(mappedBy = ..., cascade = CascadeType.ALL, orphanRemoval = true)` relationships remain intact.
- Existing many-to-many join tables for users/roles and treks/guides remain intact.
- New element collections use dedicated collection tables and lazy fetch.

## Enum Review

All enum fields in entities continue to use `@Enumerated(EnumType.STRING)`:

- `Booking.status`
- `Coupon.discountType`
- `Itinerary.difficultyDay`
- `Payment.gateway`
- `Payment.status`
- `Payment.method`
- `Trek.difficulty`
- `Trek.status`

## ID Strategy Review

All checked entity IDs use `GenerationType.IDENTITY`, which is appropriate for MySQL auto-increment IDs.

No PostgreSQL UUID generation strategy was found.

## Configuration Changes

### `application.properties`

Removed:

- `spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect`
- `spring.jpa.properties.hibernate.default_schema=public`

Reason:

- Hibernate 6 can detect MySQL dialect from the JDBC connection.
- `default_schema=public` is PostgreSQL-oriented and wrong for MySQL.

Kept:

- MySQL JDBC URL default
- MySQL driver class
- MySQL connector dependency

## Dependency Changes

### `pom.xml`

Removed:

- `org.postgresql:postgresql`

Kept:

- `com.mysql:mysql-connector-j`

No PostgreSQL-only Hibernate type dependency was present.

## Potential Risks

- Existing production data stored in old PostgreSQL array columns must be migrated into the new collection tables before dropping old columns.
- `spring.jpa.hibernate.ddl-auto=update` may create the new collection tables automatically, but a controlled production migration is safer.
- `Payment.metadata` now uses MySQL `JSON`; existing `jsonb` data from PostgreSQL would need export/import conversion if migrating real data between databases.
- The SQL files under `database/` still appear PostgreSQL-oriented and were not rewritten in this backend mapping pass.
- Lazy element collections should be accessed inside transactions; current admin mapping methods are transactional/read-only, so existing admin responses remain safe.

## Remaining TODOs

- Create explicit MySQL migration SQL for:
  - `trek_highlights`
  - `trek_inclusions`
  - `trek_exclusions`
  - `trek_things_to_carry`
  - `guide_languages`
  - `guide_certifications`
  - `guide_specializations`
  - `review_photos`
  - `itinerary_meals_included`
- Migrate any existing array-column data into the new collection tables.
- Review and convert `database/schema.sql` and existing migration files to MySQL syntax if those files are used for provisioning.
- Consider replacing `ddl-auto=update` with managed migrations for production.
