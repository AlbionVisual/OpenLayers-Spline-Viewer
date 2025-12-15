-- Активация расширения PostGIS в текущей базе данных
CREATE EXTENSION postgis;
SELECT postgis_full_version();

-- Создаем таблицу для городов
CREATE TABLE cities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    population INTEGER,
    -- Столбец для хранения геометрических данных (точек)
    geom GEOMETRY(Point, 4326) 
    -- Point: тип объекта (точка)
    -- 4326: SRID (система координат WGS 84 - широта/долгота)
);

-- Добавляем пространственный индекс для ускорения гео-запросов
CREATE INDEX cities_geom_idx ON cities USING GIST (geom);

-- Вставляем несколько городов, используя ST_MakePoint(долгота, широта)
INSERT INTO cities (name, population, geom) VALUES
('Москва', 12600000, ST_MakePoint(37.6173, 55.7558)), -- (Lon, Lat)
('Лондон', 8900000, ST_MakePoint(-0.1278, 51.5074)),
('Нью-Йорк', 8400000, ST_MakePoint(-74.0060, 40.7128));



SELECT 
    name, 
    population,
    ST_AsText(geom) AS wkt_coordinates -- Выводим координаты в текстовом формате WKT
FROM 
    cities
WHERE 
    ST_Y(geom) > 50;