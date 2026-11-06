-- Passwords and verification codes must be protected by the backend before insert.
CREATE TABLE app_user (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(30) NOT NULL,
    email VARCHAR(254) NOT NULL,
    password_hash TEXT NOT NULL,
    email_verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT app_user_username_format
        CHECK (username ~ '^[A-Za-z0-9_]{3,30}$'),
    CONSTRAINT app_user_email_not_blank
        CHECK (email = btrim(email) AND email <> ''),
    CONSTRAINT app_user_password_hash_not_blank
        CHECK (btrim(password_hash) <> ''),
    CONSTRAINT app_user_verification_after_creation
        CHECK (email_verified_at IS NULL OR email_verified_at >= created_at)
);

-- Usernames are ASCII; email comparison is case-insensitive under the C collation.
CREATE UNIQUE INDEX app_user_username_unique
    ON app_user (lower(username COLLATE "C"));
CREATE UNIQUE INDEX app_user_email_unique
    ON app_user (lower(email COLLATE "C"));

CREATE TABLE email_verification_code (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
    code_hash BYTEA NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT now() + interval '5 minutes',
    attempts SMALLINT NOT NULL DEFAULT 0,
    consumed_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,

    CONSTRAINT verification_code_hash_length CHECK (octet_length(code_hash) = 32),
    CONSTRAINT verification_code_expiry CHECK (expires_at = created_at + interval '5 minutes'),
    CONSTRAINT verification_code_attempts CHECK (attempts BETWEEN 0 AND 5),
    CONSTRAINT verification_code_consumed_after_creation
        CHECK (consumed_at IS NULL OR consumed_at >= created_at),
    CONSTRAINT verification_code_revoked_after_creation
        CHECK (revoked_at IS NULL OR revoked_at >= created_at),
    CONSTRAINT verification_code_one_final_state
        CHECK (consumed_at IS NULL OR revoked_at IS NULL)
);

-- Before issuing a replacement, the backend must revoke the previous code.
CREATE UNIQUE INDEX verification_code_one_open_per_user
    ON email_verification_code (user_id)
    WHERE consumed_at IS NULL AND revoked_at IS NULL;
