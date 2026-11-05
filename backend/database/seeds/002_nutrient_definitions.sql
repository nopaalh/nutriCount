INSERT INTO nutrient_definition (
    code,
    display_name,
    canonical_unit,
    composition_column,
    scientific_definition
)
VALUES
    ('ENERGY', 'Energi', 'kcal', 'energy_kcal',
     'Energi pangan; metode penentuan mengikuti sumber.'),

    ('WATER', 'Air', 'g', 'water_g',
     'Kandungan air pangan.'),

    ('PROTEIN', 'Protein', 'g', 'protein_g',
     'Protein; metode dan faktor konversi mengikuti sumber.'),

    ('TOTAL_FAT', 'Lemak total', 'g', 'total_fat_g',
     'Lemak total; metode penentuan mengikuti sumber.'),

    ('CARBOHYDRATE', 'Karbohidrat', 'g', 'carbohydrate_g',
     'Karbohidrat sesuai definisi sumber; metode penentuan perlu diperiksa.'),

    ('FIBER', 'Serat', 'g', 'fiber_g',
     'Serat sebagaimana dilaporkan sumber; jenis serat tidak diasumsikan.'),

    ('ASH', 'Abu', 'g', 'ash_g',
     'Kadar abu pangan.'),

    ('CALCIUM', 'Kalsium', 'mg', 'calcium_mg',
     'Kandungan kalsium.'),

    ('PHOSPHORUS', 'Fosfor', 'mg', 'phosphorus_mg',
     'Kandungan fosfor.'),

    ('IRON', 'Besi', 'mg', 'iron_mg',
     'Kandungan besi.'),

    ('SODIUM', 'Natrium', 'mg', 'sodium_mg',
     'Kandungan natrium.'),

    ('POTASSIUM', 'Kalium', 'mg', 'potassium_mg',
     'Kandungan kalium.'),

    ('COPPER', 'Tembaga', 'mg', 'copper_mg',
     'Kandungan tembaga.'),

    ('ZINC', 'Seng', 'mg', 'zinc_mg',
     'Kandungan seng.'),

    ('RETINOL', 'Retinol', 'ug', 'retinol_ug',
     'Massa retinol; bukan total vitamin A dalam RE atau RAE.'),

    ('BETA_CAROTENE', 'Beta-karoten', 'ug', 'beta_carotene_ug',
     'Massa beta-karoten; bukan ekuivalen vitamin A.'),

    ('TOTAL_CAROTENE', 'Karoten total', 'ug', 'total_carotene_ug',
     'Karoten total sesuai definisi sumber; bukan otomatis total karotenoid.'),

    ('THIAMIN', 'Thiamin', 'mg', 'thiamin_mg',
     'Kandungan vitamin B1.'),

    ('RIBOFLAVIN', 'Riboflavin', 'mg', 'riboflavin_mg',
     'Kandungan vitamin B2.'),

    ('NIACIN', 'Niasin', 'mg', 'niacin_mg',
     'Niasin sesuai definisi sumber; bukan otomatis niacin equivalents.'),

    ('VITAMIN_C', 'Vitamin C', 'mg', 'vitamin_c_mg',
     'Vitamin C; cakupan senyawa dan metode mengikuti sumber.')

ON CONFLICT (code) DO NOTHING;
