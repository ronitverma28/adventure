-- Auth token tables for Phase 5

CREATE TABLE refresh_tokens (
  id           BIGSERIAL PRIMARY KEY,
  token        VARCHAR(500) NOT NULL UNIQUE,
  user_id      BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at   TIMESTAMP WITH TIME ZONE NOT NULL,
  revoked_at   TIMESTAMP WITH TIME ZONE,
  device_info  VARCHAR(500),
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_token   ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);

CREATE TABLE email_verification_tokens (
  id         BIGSERIAL PRIMARY KEY,
  token      VARCHAR(500) NOT NULL UNIQUE,
  user_id    BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at    TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_email_verification_token   ON email_verification_tokens(token);
CREATE INDEX idx_email_verification_user_id ON email_verification_tokens(user_id);

CREATE TABLE password_reset_tokens (
  id         BIGSERIAL PRIMARY KEY,
  token      VARCHAR(500) NOT NULL UNIQUE,
  user_id    BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at    TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_password_reset_token   ON password_reset_tokens(token);
CREATE INDEX idx_password_reset_user_id ON password_reset_tokens(user_id);
