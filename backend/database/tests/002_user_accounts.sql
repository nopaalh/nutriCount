BEGIN;

DO $$
DECLARE
    test_user_id UUID;
    code_id UUID;
BEGIN
    INSERT INTO app_user (username, email, password_hash)
    VALUES ('Test_User', 'Test@example.com', 'synthetic-password-hash')
    RETURNING id INTO test_user_id;

    IF (SELECT email_verified_at FROM app_user WHERE id = test_user_id) IS NOT NULL THEN
        RAISE EXCEPTION 'FAIL: new account should be unverified';
    END IF;

    BEGIN
        INSERT INTO app_user (username, email, password_hash)
        VALUES ('test_user', 'other@example.com', 'synthetic-password-hash');
        RAISE EXCEPTION 'FAIL: case-insensitive duplicate username accepted';
    EXCEPTION WHEN unique_violation THEN NULL;
    END;

    BEGIN
        INSERT INTO app_user (username, email, password_hash)
        VALUES ('other_user', 'test@EXAMPLE.com', 'synthetic-password-hash');
        RAISE EXCEPTION 'FAIL: case-insensitive duplicate email accepted';
    EXCEPTION WHEN unique_violation THEN NULL;
    END;

    BEGIN
        INSERT INTO app_user (username, email, password_hash)
        VALUES ('bad@name', 'other@example.com', 'synthetic-password-hash');
        RAISE EXCEPTION 'FAIL: invalid username accepted';
    EXCEPTION WHEN check_violation THEN NULL;
    END;

    BEGIN
        INSERT INTO app_user (username, email, password_hash)
        VALUES ('valid_name', ' ', 'synthetic-password-hash');
        RAISE EXCEPTION 'FAIL: blank email accepted';
    EXCEPTION WHEN check_violation THEN NULL;
    END;

    BEGIN
        INSERT INTO app_user (username, email, password_hash)
        VALUES ('valid_name', 'other@example.com', ' ');
        RAISE EXCEPTION 'FAIL: blank password hash accepted';
    EXCEPTION WHEN check_violation THEN NULL;
    END;

    INSERT INTO email_verification_code (user_id, code_hash)
    VALUES (test_user_id, decode(repeat('ab', 32), 'hex'))
    RETURNING id INTO code_id;

    BEGIN
        INSERT INTO email_verification_code (user_id, code_hash)
        VALUES (test_user_id, decode(repeat('ab', 32), 'hex'));
        RAISE EXCEPTION 'FAIL: multiple open codes accepted';
    EXCEPTION WHEN unique_violation THEN NULL;
    END;

    BEGIN
        UPDATE email_verification_code SET attempts = 6 WHERE id = code_id;
        RAISE EXCEPTION 'FAIL: more than five attempts accepted';
    EXCEPTION WHEN check_violation THEN NULL;
    END;

    BEGIN
        UPDATE email_verification_code SET expires_at = created_at + interval '6 minutes'
        WHERE id = code_id;
        RAISE EXCEPTION 'FAIL: invalid expiry accepted';
    EXCEPTION WHEN check_violation THEN NULL;
    END;

    BEGIN
        INSERT INTO email_verification_code (user_id, code_hash)
        VALUES (gen_random_uuid(), decode(repeat('ab', 32), 'hex'));
        RAISE EXCEPTION 'FAIL: invalid user accepted';
    EXCEPTION WHEN foreign_key_violation THEN NULL;
    END;

    UPDATE email_verification_code SET revoked_at = now() WHERE id = code_id;
    INSERT INTO email_verification_code (user_id, code_hash)
    VALUES (test_user_id, decode(repeat('cd', 32), 'hex'));

    DELETE FROM app_user WHERE id = test_user_id;
    IF EXISTS (SELECT 1 FROM email_verification_code WHERE user_id = test_user_id) THEN
        RAISE EXCEPTION 'FAIL: deleting user did not remove codes';
    END IF;

    RAISE NOTICE 'PASS: all checks in 002_user_accounts.sql';
END;
$$;

ROLLBACK;
