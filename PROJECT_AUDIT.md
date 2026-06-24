# ADVENTURE Project Audit

Audit date: 2026-06-24

Scope: `frontend/`, `backend/`, and `database/`. This audit intentionally does not implement Phase 12. It records the current architecture, observed build results, missing Phase 12 work, broken routes/imports, API contract issues, security risks, SEO gaps, performance risks, and database risks.

## Verification Summary

| Area | Command | Result |
| --- | --- | --- |
| Frontend TypeScript | `npm run type-check` | Passed |
| Frontend lint | `npm run lint` | Failed/interrupted by interactive Next ESLint setup prompt because no committed ESLint config exists |
| Frontend production build | `npm run build` | Passed with `metadataBase` warnings |
| Backend build | `.\mvnw.cmd clean install` | Failed during Java compilation |
| Git status | `git status --short` | Failed because this directory is not a Git repository |

## Current Architecture

### Frontend

- Next.js 15 App Router with React 19, TypeScript, Tailwind CSS, next-themes, Zustand, TanStack Query, Axios, React Hook Form, Zod, Framer Motion, and lucide-react.
- App routes currently present:
  - Public/main: `/`, `/treks`, `/treks/[slug]`, `/planner`
  - Auth: `/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-email`
  - User: `/bookings`, `/bookings/new`, `/bookings/[bookingRef]`, `/profile`
- Data layer:
  - API wrappers exist in `frontend/src/lib/api`.
  - Trek, booking, planner, and detail pages currently depend heavily on `MOCK_TREKS`, not backend `/treks` endpoints.
  - Zustand stores persist auth and booking state in browser storage.
- Theme:
  - `next-themes` provider exists.
  - Tailwind dark mode is class-based.
  - CSS variables define `.dark` tokens.
  - No visible theme toggle was found.

### Backend

- Spring Boot 3.2.3, Java 21, Spring Security, JWT, JPA/Hibernate, validation, mail, cache starter, actuator, SpringDoc, Razorpay SDK, Cloudinary SDK, Lombok, MapStruct.
- Packages:
  - 4 controllers: Auth, Booking, Admin, Community
  - 5 service interfaces and implementations
  - 22 entity files
  - 17 repositories
  - DTO request/response packages
  - Security config, CORS config, JWT provider/filter
- `AdventureApplication` enables JPA auditing, caching, async, and scheduling.
- Backend currently does not compile, so runtime behavior cannot be trusted until compilation is repaired.

### Database

- PostgreSQL-oriented `database/schema.sql`.
- Migrations present:
  - `V2__auth_tokens.sql`
  - `V3__booking_travelers.sql`
- No `V1__...` migration was found, and the complete schema file is not named like a Flyway migration.
- Schema covers core entities such as roles, users, treks, guides, bookings, payments, reviews, wishlist, notifications.
- Schema does not cover current backend community entities such as community posts, comments, likes, discussions, replies, or user follows.

## Phase 12 Requirement Gaps

| Requirement | Severity | Current State |
| --- | --- | --- |
| Dark mode | Medium | Provider and CSS tokens exist, but default theme is `light`, no toggle found, no full-page dark audit completed |
| Multi-language EN/HI | High | No i18n framework, translation JSON, `[locale]` routes, localized metadata, or language switcher found |
| SEO-friendly localized URLs | High | No `/en/...` or `/hi/...` route structure |
| Multi-currency INR/USD/EUR | High | Basic formatter exists with default INR only; no currency context, switcher, exchange strategy, or admin pricing support |
| SEO optimization | High | Root metadata exists and trek detail metadata exists, but no `metadataBase`, no canonical URLs, no JSON-LD, no robots route, no sitemap route |
| Blog system | High | Footer links `/blog`, but no blog frontend or backend blog/category/tag model found |
| Performance optimization | Medium | Next build passes, but many raw `<img>` tags bypass Next image optimization; no Lighthouse evidence |
| Backend caching | Medium | `@EnableCaching` exists, but no `@Cacheable`/eviction usage found |
| Rate limiting | High | No Bucket4j dependency/config/filter found |
| Security hardening | Critical | Backend compile failure blocks security verification; CSP/security headers absent; secrets present as defaults |
| Analytics | Medium | No Google Analytics integration or reusable analytics service found |

## Critical Findings

### 1. Backend Does Not Compile

Severity: Critical

`.\mvnw.cmd clean install` fails during compilation. The first errors show Lombok-generated members are not available:

- `GlobalExceptionHandler`: missing `log`
- `ApiResponse`: missing `builder()`
- `AdminServiceImpl`: missing getters/setters/builders on DTOs/entities such as `AdminTrekRequest`, `Trek`, `Booking`, and `Review`

Impact:

- Backend cannot be packaged, tested, deployed, or started reliably.
- API contract verification is blocked.
- Security and payment runtime behavior cannot be fully audited until compile is fixed.

Likely cause:

- Lombok annotation processing is not running correctly in Maven/compiler configuration or local toolchain.

### 2. Backend Database Configuration Is Internally Inconsistent

Severity: Critical

`application.properties` uses:

- `spring.datasource.driver-class-name=org.mysql.cj.jdbc.Driver`
- PostgreSQL dialect: `org.hibernate.dialect.PostgreSQLDialect`
- PostgreSQL dependency in `pom.xml`
- Invalid default URL: `jdbc:localhost://localhost:5432/adventure_db`

Impact:

- Even after compilation is fixed, backend startup will likely fail with missing MySQL driver or invalid JDBC URL.
- Hibernate dialect and schema are PostgreSQL-oriented, so MySQL settings are unsafe.

### 3. Auth Middleware And Client Auth Storage Are Mismatched

Severity: Critical

The Next middleware reads an `adventure-token` cookie. The login flow stores tokens only in Zustand/localStorage and does not set that cookie.

Impact:

- Authenticated users can still be redirected away from `/bookings`, `/profile`, and other protected routes because middleware cannot see localStorage.
- SSR-safe auth is not actually implemented.
- Protected route behavior will be inconsistent between middleware and client state.

### 4. Public Trek API Is Referenced But Backend Has No Trek Controller

Severity: Critical

Frontend API wrappers reference:

- `GET /treks`
- `GET /treks/{slug}`
- `GET /treks/featured`
- `GET /treks/search`

Security config also permits these routes, but there is no `TrekController` in `backend/src/main/java/com/adventure/controller`.

Impact:

- Frontend cannot switch from mock trek data to backend data without 404s.
- API contract is incomplete for the platform's core product surface.

### 5. Payment History API Is Referenced But No Payment Controller Exists

Severity: High

Frontend calls:

- `GET /payments/history`

Backend has payment service methods and repositories, but no exposed `PaymentController`.

Impact:

- Payment history UI/API integration will fail.
- Payment lifecycle endpoints for verification/refund are partially implemented in service but not externally reachable.

### 6. Secrets And Credentials Are Present In Default Configuration

Severity: Critical

`application.properties` includes default values for:

- Database username/password
- Mail username/password
- JWT secret
- Razorpay test secret
- Stripe test secret

Impact:

- Credentials can leak through source control or deployment artifacts.
- Default production startup may accidentally use weak/dev secrets.

## High Severity Findings

### Frontend Routing And Broken Links

Severity: High

Current route tree lacks pages linked from navigation/footer:

- `/about`
- `/contact`
- `/wishlist`
- `/dashboard/admin`
- `/dashboard/admin/treks`
- `/dashboard/admin/bookings`
- `/dashboard/admin/users`
- `/dashboard/admin/guides`
- `/guides`
- `/blog`
- `/careers`
- `/press`
- `/help`
- `/booking-policy`
- `/cancellation`
- `/privacy`
- `/terms`
- `/sitemap`

Impact:

- Users can navigate to 404s from primary navigation and footer.
- Admin links exist in config but no admin frontend is implemented.

### Lint Command Is Not CI-Safe

Severity: High

`npm run lint` runs `next lint`, which prompts interactively to configure ESLint.

Impact:

- CI/CD lint step will hang or fail.
- The project cannot meet the requested "npm run lint succeeds" requirement until ESLint config is committed and the script is updated for Next 15 expectations.

### SEO Metadata Is Incomplete

Severity: High

`npm run build` warns that `metadataBase` is missing, so OpenGraph/Twitter image URLs resolve against localhost.

Other gaps:

- No canonical URLs.
- No sitemap route.
- No robots route.
- No JSON-LD for Organization, Treks, or Reviews.
- Trek pages use mock data for metadata.

Impact:

- Social cards may be wrong in production.
- Search indexing lacks structured data and canonical guidance.

### i18n Is Not Present

Severity: High

No translation files, locale segment, locale middleware, server-side dictionary loader, or language switcher were found.

Impact:

- `/en/treks` and `/hi/treks` cannot work.
- SEO-friendly language URLs are not implemented.

### Backend Security Headers Are Missing

Severity: High

Security config disables CSRF for stateless APIs, which is acceptable if JWT is header-only and cookies are not used. However:

- No CSP header found.
- No explicit HSTS/header policy found.
- No 429 rate-limit JSON handler found.
- Swagger/OpenAPI is publicly exposed.

Impact:

- Browser-side hardening is incomplete.
- Public docs exposure may be undesirable in production.

### Database Migrations Are Incomplete

Severity: High

The database folder has no `V1__schema.sql` migration, while `V2` and `V3` assume base tables already exist.

Also, backend community entities are missing corresponding SQL in `database/schema.sql`.

Impact:

- Fresh database provisioning via migrations will fail or be incomplete.
- Schema drift exists between JPA entities and SQL files.

## Medium Severity Findings

### Theme Support Is Partial

Severity: Medium

The provider and dark CSS variables are in place, but:

- Default theme is `light` instead of using system preference by default.
- No theme toggle UI was found.
- No explicit hydration audit was performed.

### Currency Support Is Partial

Severity: Medium

`formatCurrency(amount, currency = 'INR')` exists, and payment entities store a currency string. However:

- No currency context.
- No currency switcher.
- No USD/EUR conversion policy.
- Checkout hardcodes INR in places.
- Backend Razorpay currency is single-value config.

### Raw Images Bypass Next Image Optimization

Severity: Medium

Many components use raw `<img>` tags instead of `next/image`.

Impact:

- Missed responsive image optimization.
- Potential Lighthouse and Core Web Vitals penalty.

### Mock Data Dominates Core User Flows

Severity: Medium

Trek listing, trek detail, booking selection, and planner use `MOCK_TREKS`.

Impact:

- Backend changes will not be visible in core pages.
- Production freshness, availability, pricing, and admin updates are disconnected from the UI.

### Cache Is Enabled But Not Used

Severity: Medium

`@EnableCaching` and Spring cache starter exist, but no cache annotations were found.

Impact:

- Treks, popular treks, reviews, and destinations are not cached as required by Phase 12.

## Low Severity Findings

### Mojibake/Encoding Artifacts

Severity: Low

Several comments and string literals show corrupted characters such as `â€”`, `â€¢`, and box-drawing artifacts.

Impact:

- Mostly cosmetic in comments, but some user-facing text such as password placeholders can look broken.

### README Is Still A Template

Severity: Low

The root README is GitLab boilerplate and does not describe setup, environment variables, or verification commands for this project.

## API Contract Mismatches

| Frontend Call | Backend Status | Severity |
| --- | --- | --- |
| `GET /treks` | No controller found | Critical |
| `GET /treks/{slug}` | No controller found | Critical |
| `GET /treks/featured` | No controller found | Critical |
| `GET /treks/search` | No controller found | Critical |
| `GET /payments/history` | No controller found | High |
| Admin trek create with `FormData` | Backend expects JSON `AdminTrekRequest` | High |
| Auth middleware cookie check | Login stores only localStorage tokens | Critical |
| `/dashboard/admin*` links | No frontend pages | High |
| `/wishlist` link and protected route | No page found | High |

## Security Issues

| Issue | Severity | Notes |
| --- | --- | --- |
| Backend does not compile | Critical | Blocks real security validation |
| Secrets in default config | Critical | Mail and DB credentials included as defaults |
| JWT secret has dev default | High | Production must fail fast if unset |
| No rate limiting | High | Auth, payment, and booking APIs are unprotected from brute force or abuse |
| No CSP/security headers | High | Required Phase 12 hardening not present |
| Swagger/OpenAPI public | Medium | Should be profile-gated or protected in production |
| CSRF disabled | Medium | Acceptable for header JWT, but conflicts if moving auth to cookies without CSRF design |
| JWT invalid-token handling logs only | Medium | Filter does not return a structured auth error for invalid Bearer tokens |

## Performance Issues

| Issue | Severity | Notes |
| --- | --- | --- |
| Raw `<img>` usage | Medium | Replace key images with `next/image` |
| Mock-heavy pages | Medium | No backend pagination/cache path exercised |
| No Lighthouse evidence | Medium | Target 90+ cannot be verified from repo audit alone |
| Potential JPA N+1 | Medium | Entity relationships are lazy/eager mixed; no systematic entity graphs on read-heavy trek detail/review paths |
| No service-level caching | Medium | Cache starter exists but annotations absent |

## SEO Issues

| Issue | Severity |
| --- | --- |
| Missing `metadataBase` | High |
| Missing canonical URLs | High |
| Missing sitemap route | High |
| Missing robots route | High |
| Missing JSON-LD | High |
| Missing localized alternate URLs | High |
| Blog routes linked but absent | High |
| Trek metadata generated from mock data | Medium |

## Database Issues

| Issue | Severity | Notes |
| --- | --- | --- |
| No `V1` migration | High | `V2` and `V3` are not enough for fresh setup |
| Schema/entity drift | High | Community tables absent from schema file |
| PostgreSQL schema vs MySQL driver config | Critical | Startup/data layer mismatch |
| `ddl-auto=update` in default config | High | Unsafe for production |
| Native PostgreSQL array columns | Medium | JPA array mapping may need explicit Hibernate types and PostgreSQL-only support |
| Payment and booking constraints need review | Medium | Workflow-specific uniqueness/idempotency constraints for payment IDs are limited |

## Build And Tooling Issues

| Issue | Severity |
| --- | --- |
| Backend Maven build fails | Critical |
| Lint command is interactive | High |
| Frontend build passes but emits metadata warnings | Medium |
| No test suites were observed/runnable after backend compile failure | Medium |
| Directory is not a Git repository | Low |

## Recommended Implementation Order

1. Fix backend compilation and Lombok annotation processing.
2. Fix backend datasource configuration for PostgreSQL and remove unsafe default secrets.
3. Add a real `V1` migration and reconcile SQL schema with all JPA entities.
4. Implement missing public Trek controller/service endpoints or remove frontend API wrappers until ready.
5. Fix auth strategy: either use secure HttpOnly cookies with middleware support, or remove SSR middleware auth checks and keep client-only auth.
6. Add CI-safe ESLint config and update the lint script.
7. Implement Phase 12 in vertical slices:
   - SEO foundation: `metadataBase`, canonical URLs, sitemap, robots, JSON-LD.
   - i18n route structure and dictionaries.
   - currency context and formatter integration.
   - dark-mode toggle and full visual pass.
   - blog backend/frontend.
   - cache annotations and eviction.
   - Bucket4j rate limiting.
   - CSP/security headers.
   - analytics service and event instrumentation.
8. Replace mock trek flows with backend-backed, paginated, cached data.
9. Re-run full verification: frontend lint/type-check/build, backend clean install, and smoke-test all route/API contracts.

## Approval Gate

No Phase 12 implementation has been performed in this audit step. The only intended repository change is this `PROJECT_AUDIT.md` file. Approval is recommended before making code changes because the required fixes span build tooling, backend persistence, auth architecture, frontend routing, SEO, i18n, caching, security, and payments.
