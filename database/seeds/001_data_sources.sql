INSERT INTO data_source (
    code,
    name,
    publisher,
    priority_rank,
    website
)
VALUES
    (
        'TKPI',
        'Tabel Komposisi Pangan Indonesia',
        'Kementerian Kesehatan Republik Indonesia',
        1,
        NULL
    ),
    (
        'USDA',
        'USDA FoodData Central',
        'U.S. Department of Agriculture',
        2,
        'https://fdc.nal.usda.gov/'
    )
ON CONFLICT (code) DO NOTHING;
