CREATE TABLE food (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    food_name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    food_state VARCHAR(60),
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT food_name_not_blank
        CHECK (btrim(food_name) <> '')
);

CREATE INDEX food_name_idx ON food (food_name);


CREATE TABLE data_source (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    publisher VARCHAR(200),
    priority_rank INTEGER NOT NULL DEFAULT 100,
    website TEXT,

    CONSTRAINT data_source_code_not_blank
        CHECK (btrim(code) <> ''),

    CONSTRAINT data_source_name_not_blank
        CHECK (btrim(name) <> ''),

    CONSTRAINT data_source_priority_positive
        CHECK (priority_rank > 0)
);

CREATE TABLE dataset_release (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    data_source_id UUID NOT NULL
        REFERENCES data_source(id) ON DELETE RESTRICT,

    version_label VARCHAR(100) NOT NULL,
    publication_date DATE,
    source_url TEXT,
    source_file_sha256 CHAR(64),

    basis_amount NUMERIC(12,4) NOT NULL,
    basis_unit VARCHAR(30) NOT NULL,
    basis_description VARCHAR(160) NOT NULL,

    imported_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_active BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT dataset_release_source_version_unique
        UNIQUE (data_source_id, version_label),

    CONSTRAINT dataset_release_version_not_blank
        CHECK (btrim(version_label) <> ''),

    CONSTRAINT dataset_release_basis_positive
        CHECK (basis_amount > 0),

    CONSTRAINT dataset_release_basis_unit_not_blank
        CHECK (btrim(basis_unit) <> ''),

    CONSTRAINT dataset_release_basis_description_not_blank
        CHECK (btrim(basis_description) <> ''),

    CONSTRAINT dataset_release_sha256_valid
        CHECK (
            source_file_sha256 IS NULL
            OR source_file_sha256 ~ '^[0-9A-Fa-f]{64}$'
        )
);

CREATE UNIQUE INDEX dataset_release_one_active_per_source
    ON dataset_release (data_source_id)
    WHERE is_active = true;

    CREATE TABLE nutrient_definition (
        code VARCHAR(60) PRIMARY KEY,
        display_name VARCHAR(150) NOT NULL,
        canonical_unit VARCHAR(20) NOT NULL,
        composition_column VARCHAR(80) NOT NULL UNIQUE,
        scientific_definition TEXT,
        is_active BOOLEAN NOT NULL DEFAULT true,

        CONSTRAINT nutrient_definition_code_not_blank
            CHECK (btrim(code) <> ''),

        CONSTRAINT nutrient_definition_name_not_blank
            CHECK (btrim(display_name) <> ''),

        CONSTRAINT nutrient_definition_unit_not_blank
            CHECK (btrim(canonical_unit) <> ''),

        CONSTRAINT nutrient_definition_column_not_blank
            CHECK (btrim(composition_column) <> '')
    );

    CREATE TABLE food_composition (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

        food_id UUID NOT NULL
            REFERENCES food(id) ON DELETE RESTRICT,

        dataset_release_id UUID NOT NULL
            REFERENCES dataset_release(id) ON DELETE RESTRICT,

        source_food_code VARCHAR(100) NOT NULL,
        source_food_name VARCHAR(255) NOT NULL,
        source_reference VARCHAR(255),

        edible_portion_percent NUMERIC(7,4),

        energy_kcal NUMERIC(18,6),
        water_g NUMERIC(18,6),
        protein_g NUMERIC(18,6),
        total_fat_g NUMERIC(18,6),
        carbohydrate_g NUMERIC(18,6),
        fiber_g NUMERIC(18,6),
        ash_g NUMERIC(18,6),

        calcium_mg NUMERIC(18,6),
        phosphorus_mg NUMERIC(18,6),
        iron_mg NUMERIC(18,6),
        sodium_mg NUMERIC(18,6),
        potassium_mg NUMERIC(18,6),
        copper_mg NUMERIC(18,6),
        zinc_mg NUMERIC(18,6),

        retinol_ug NUMERIC(18,6),
        beta_carotene_ug NUMERIC(18,6),
        total_carotene_ug NUMERIC(18,6),

        thiamin_mg NUMERIC(18,6),
        riboflavin_mg NUMERIC(18,6),
        niacin_mg NUMERIC(18,6),
        vitamin_c_mg NUMERIC(18,6),

        original_record JSONB NOT NULL,
        nutrient_flags JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

        CONSTRAINT food_composition_release_code_unique
            UNIQUE (dataset_release_id, source_food_code),

        CONSTRAINT food_composition_code_not_blank
            CHECK (btrim(source_food_code) <> ''),

        CONSTRAINT food_composition_name_not_blank
            CHECK (btrim(source_food_name) <> ''),

        CONSTRAINT food_composition_bdd_valid
            CHECK (edible_portion_percent BETWEEN 0 AND 100),

        CONSTRAINT food_composition_original_record_object
            CHECK (jsonb_typeof(original_record) = 'object'),

        CONSTRAINT food_composition_nutrient_flags_object
            CHECK (jsonb_typeof(nutrient_flags) = 'object'),

        CONSTRAINT food_composition_nutrients_nonnegative
            CHECK (
                energy_kcal >= 0
                AND water_g >= 0
                AND protein_g >= 0
                AND total_fat_g >= 0
                AND carbohydrate_g >= 0
                AND fiber_g >= 0
                AND ash_g >= 0
                AND calcium_mg >= 0
                AND phosphorus_mg >= 0
                AND iron_mg >= 0
                AND sodium_mg >= 0
                AND potassium_mg >= 0
                AND copper_mg >= 0
                AND zinc_mg >= 0
                AND retinol_ug >= 0
                AND beta_carotene_ug >= 0
                AND total_carotene_ug >= 0
                AND thiamin_mg >= 0
                AND riboflavin_mg >= 0
                AND niacin_mg >= 0
                AND vitamin_c_mg >= 0
            )
    );

    CREATE INDEX food_composition_food_id_idx
        ON food_composition (food_id);

        CREATE TABLE food_match (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

            target_composition_id UUID NOT NULL
                REFERENCES food_composition(id) ON DELETE RESTRICT,

            donor_composition_id UUID NOT NULL
                REFERENCES food_composition(id) ON DELETE RESTRICT,

            status VARCHAR(30) NOT NULL DEFAULT 'CANDIDATE',
            matching_method VARCHAR(80) NOT NULL,
            matching_rule_version VARCHAR(60),

            eligible_nutrient_codes JSONB NOT NULL DEFAULT '[]'::jsonb,
            rationale TEXT,

            reviewed_by VARCHAR(120),
            reviewed_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

            CONSTRAINT food_match_pair_unique
                UNIQUE (target_composition_id, donor_composition_id),

            CONSTRAINT food_match_not_self
                CHECK (target_composition_id <> donor_composition_id),

            CONSTRAINT food_match_status_valid
                CHECK (status IN ('CANDIDATE', 'APPROVED', 'REJECTED')),

            CONSTRAINT food_match_method_not_blank
                CHECK (btrim(matching_method) <> ''),

            CONSTRAINT food_match_eligible_codes_array
                CHECK (jsonb_typeof(eligible_nutrient_codes) = 'array')
        );

        CREATE INDEX food_match_target_status_idx
            ON food_match (target_composition_id, status);

        CREATE INDEX food_match_donor_idx
            ON food_match (donor_composition_id);
