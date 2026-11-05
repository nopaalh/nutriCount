BEGIN;

DO $$
DECLARE
    source_id UUID;
    release_a UUID;
    release_b UUID;
    food_id_test UUID;
    composition_a UUID;
    composition_b UUID;
BEGIN
    -- Reference seeds harus sudah tersedia.
    IF NOT EXISTS (
        SELECT 1 FROM data_source
        WHERE code = 'TKPI' AND priority_rank = 1
    ) OR NOT EXISTS (
        SELECT 1 FROM data_source
        WHERE code = 'USDA' AND priority_rank = 2
    ) THEN
        RAISE EXCEPTION 'FAIL: source priorities';
    END IF;

    IF (SELECT count(*) FROM nutrient_definition) <> 21 THEN
        RAISE EXCEPTION 'FAIL: expected 21 nutrient definitions';
    END IF;

    -- Synthetic fixtures.
    INSERT INTO data_source (code, name)
    VALUES ('TEST_PHASE1', 'Synthetic test source')
    RETURNING id INTO source_id;

    INSERT INTO food (food_name)
    VALUES ('TEST synthetic food')
    RETURNING id INTO food_id_test;

    INSERT INTO dataset_release (
        data_source_id, version_label,
        basis_amount, basis_unit, basis_description, is_active
    )
    VALUES (
        source_id, 'TEST-A',
        100, 'g', 'edible portion', true
    )
    RETURNING id INTO release_a;

    -- Satu source boleh memiliki beberapa releases.
    INSERT INTO dataset_release (
        data_source_id, version_label,
        basis_amount, basis_unit, basis_description
    )
    VALUES (
        source_id, 'TEST-B',
        100, 'g', 'edible portion'
    )
    RETURNING id INTO release_b;

    -- NULL, reported zero, dan decimal harus tersimpan berbeda.
    INSERT INTO food_composition (
        food_id, dataset_release_id,
        source_food_code, source_food_name,
        protein_g, calcium_mg, vitamin_c_mg, original_record
    )
    VALUES (
        food_id_test, release_a,
        'TEST-001', 'TEST synthetic food',
        8.123456, NULL, 0, '{"synthetic": true}'
    )
    RETURNING id INTO composition_a;

    IF NOT EXISTS (
        SELECT 1 FROM food_composition
        WHERE id = composition_a
          AND protein_g = 8.123456
          AND calcium_mg IS NULL
          AND vitamin_c_mg = 0
          AND edible_portion_percent IS NULL
    ) THEN
        RAISE EXCEPTION 'FAIL: decimal, NULL or zero preservation';
    END IF;

    -- Kode sama boleh digunakan pada release berbeda.
    INSERT INTO food_composition (
        food_id, dataset_release_id,
        source_food_code, source_food_name, original_record
    )
    VALUES (
        food_id_test, release_b,
        'TEST-001', 'TEST synthetic donor', '{"synthetic": true}'
    )
    RETURNING id INTO composition_b;

    -- Duplicate source code harus ditolak.
    BEGIN
        INSERT INTO data_source (code, name)
        VALUES ('TEST_PHASE1', 'Duplicate');
        RAISE EXCEPTION 'FAIL: duplicate source accepted';
    EXCEPTION WHEN unique_violation THEN
        NULL;
    END;

    -- Duplicate version dalam source yang sama harus ditolak.
    BEGIN
        INSERT INTO dataset_release (
            data_source_id, version_label,
            basis_amount, basis_unit, basis_description
        )
        VALUES (source_id, 'TEST-A', 100, 'g', 'edible portion');
        RAISE EXCEPTION 'FAIL: duplicate release accepted';
    EXCEPTION WHEN unique_violation THEN
        NULL;
    END;

    -- Dua active releases dalam satu source harus ditolak.
    BEGIN
        UPDATE dataset_release
        SET is_active = true
        WHERE id = release_b;
        RAISE EXCEPTION 'FAIL: multiple active releases accepted';
    EXCEPTION WHEN unique_violation THEN
        NULL;
    END;

    -- Duplicate food code dalam satu release harus ditolak.
    BEGIN
        INSERT INTO food_composition (
            food_id, dataset_release_id,
            source_food_code, source_food_name, original_record
        )
        VALUES (
            food_id_test, release_a,
            'TEST-001', 'Duplicate', '{}'
        );
        RAISE EXCEPTION 'FAIL: duplicate food code accepted';
    EXCEPTION WHEN unique_violation THEN
        NULL;
    END;

    -- Foreign key yang tidak ada harus ditolak.
    BEGIN
        UPDATE food_composition
        SET food_id = gen_random_uuid()
        WHERE id = composition_a;
        RAISE EXCEPTION 'FAIL: invalid foreign key accepted';
    EXCEPTION WHEN foreign_key_violation THEN
        NULL;
    END;

    -- Nilai negatif harus ditolak meski nutrient lain NULL.
    BEGIN
        UPDATE food_composition
        SET protein_g = -1
        WHERE id = composition_a;
        RAISE EXCEPTION 'FAIL: negative nutrient accepted';
    EXCEPTION WHEN check_violation THEN
        NULL;
    END;

    -- BDD di luar rentang harus ditolak.
    BEGIN
        UPDATE food_composition
        SET edible_portion_percent = 101
        WHERE id = composition_a;
        RAISE EXCEPTION 'FAIL: invalid BDD accepted';
    EXCEPTION WHEN check_violation THEN
        NULL;
    END;

    -- Self-match harus ditolak.
    BEGIN
        INSERT INTO food_match (
            target_composition_id, donor_composition_id,
            matching_method
        )
        VALUES (composition_a, composition_a, 'MANUAL_REVIEW');
        RAISE EXCEPTION 'FAIL: self-match accepted';
    EXCEPTION WHEN check_violation THEN
        NULL;
    END;

    -- Match valid harus berhasil.
    INSERT INTO food_match (
        target_composition_id, donor_composition_id,
        matching_method
    )
    VALUES (composition_a, composition_b, 'MANUAL_REVIEW');

    -- Status sembarang harus ditolak.
    BEGIN
        UPDATE food_match
        SET status = 'INVALID'
        WHERE target_composition_id = composition_a
          AND donor_composition_id = composition_b;
        RAISE EXCEPTION 'FAIL: invalid status accepted';
    EXCEPTION WHEN check_violation THEN
        NULL;
    END;

    RAISE NOTICE 'PASS: all checks in 001_constraints.sql';
END;
$$;

ROLLBACK;
