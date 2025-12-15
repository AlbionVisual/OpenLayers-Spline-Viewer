CREATE EXTENSION IF NOT EXISTS postgis;
SELECT postgis_full_version();

CREATE TABLE world_cities (
    city_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    geom GEOMETRY(Point, 4326) -- Тип: Точка, SRID: 4326
);

INSERT INTO world_cities (name, geom) VALUES
('Москва', ST_GeomFromText('POINT(37.6173 55.7558)', 4326)),
('Париж', ST_GeomFromText('POINT(2.3522 48.8566)', 4326));

SELECT
    name,
    ST_AsText(geom) AS wkt_representation
FROM world_cities;

SELECT
    name,
    ST_AsText(ST_Transform(geom, 3857)) AS mercator_geom
FROM world_cities
WHERE name = 'Москва';

-- Создадим таблицу с типом GEOGRAPHY
CREATE TABLE geo_points (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50),
    geog GEOGRAPHY(Point, 4326) -- ВАЖНО: GEOGRAPHY
);

INSERT INTO geo_points (name, geog) VALUES
('Точка А', ST_MakePoint(37.6, 55.7)::geography), -- ST_MakePoint создает GEOMETRY, оператор ::geography преобразует его
('Точка Б', ST_MakePoint(39.9, 56.3)::geography);

-- Расчет расстояния в метрах
SELECT
    ST_Distance(
        (SELECT geog FROM geo_points WHERE name = 'Точка А'),
        (SELECT geog FROM geo_points WHERE name = 'Точка Б')
    ) AS distance_meters;