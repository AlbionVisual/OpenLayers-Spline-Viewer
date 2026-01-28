-- Заполнение случайными кривыми на эллипсах вокруг Минска
create or replace function generate_curves_on_ellipses(
    center_lon float8,
    center_lat float8,
    min_radius_km float8,
    max_radius_km float8,
    radius_ratio float8,
    amount int,
    arc_degrees float8
) returns void as $$
declare
    i int;
    radius_km float8;
    radius_lat_deg float8;
    radius_lon_deg float8;
    start_angle float8;
    p0_lon float8; p0_lat float8;
    p1_lon float8; p1_lat float8;
    p2_lon float8; p2_lat float8;
    p3_lon float8; p3_lat float8;
    angle_rad float8;
    km_per_deg_lat float8 := 111.0;
    km_per_deg_lon float8;
begin
    km_per_deg_lon := km_per_deg_lat * cos(radians(center_lat));
    
    for i in 1..amount loop
        radius_km := min_radius_km + random() * (max_radius_km - min_radius_km);
        radius_lat_deg := radius_km / km_per_deg_lat;
        radius_lon_deg := radius_km / km_per_deg_lon * radius_ratio;
        
        start_angle := random() * 360.0;
        
        if random() < 0.5 then
            angle_rad := radians(start_angle);
            p0_lon := center_lon + radius_lon_deg * cos(angle_rad);
            p0_lat := center_lat + radius_lat_deg * sin(angle_rad);
            
            angle_rad := radians(start_angle + arc_degrees / 4.0);
            p1_lon := center_lon + radius_lon_deg * cos(angle_rad);
            p1_lat := center_lat + radius_lat_deg * sin(angle_rad);
            
            angle_rad := radians(start_angle + arc_degrees / 2.0);
            p2_lon := center_lon + radius_lon_deg * cos(angle_rad);
            p2_lat := center_lat + radius_lat_deg * sin(angle_rad);
            
            perform insert_quadratic_curve(p0_lon, p0_lat, p1_lon, p1_lat, p2_lon, p2_lat);
        else
            angle_rad := radians(start_angle);
            p0_lon := center_lon + radius_lon_deg * cos(angle_rad);
            p0_lat := center_lat + radius_lat_deg * sin(angle_rad);
            
            angle_rad := radians(start_angle + arc_degrees / 3.0);
            p1_lon := center_lon + radius_lon_deg * cos(angle_rad);
            p1_lat := center_lat + radius_lat_deg * sin(angle_rad);
            
            angle_rad := radians(start_angle + 2.0 * arc_degrees / 3.0);
            p2_lon := center_lon + radius_lon_deg * cos(angle_rad);
            p2_lat := center_lat + radius_lat_deg * sin(angle_rad);
            
            angle_rad := radians(start_angle + arc_degrees);
            p3_lon := center_lon + radius_lon_deg * cos(angle_rad);
            p3_lat := center_lat + radius_lat_deg * sin(angle_rad);
            
            perform insert_biezer_curve(p0_lon, p0_lat, p1_lon, p1_lat, p2_lon, p2_lat, p3_lon, p3_lat);
        end if;
    end loop;
end;
$$ language plpgsql;

-- Пример использования:
-- radius_ratio = 1.0 - круг
-- radius_ratio > 1.0 - вытянутый по долготе (широкий)
-- radius_ratio < 1.0 - вытянутый по широте (высокий)
select generate_curves_on_ellipses(27.550013, 53.903564, 0.5, 10.0, 2.5, 300, 90.0);

-- Пример извлечения данных в заданной области (теперь можно просто передать 4 числа)
select * from get_all_curves_in_bounds(22.550513, 52.893564, 29.551013, 54.913564);

-- Примеры для извлечения данных в виде json:
select ST_AsGeoJSON(c) from curves;
select get_all_curves_as_geojson(27.550513, 53.893564, 27.551013, 53.913564) as geojson;

-- Длинна массива последнего вывода:
select json_array_length(get_all_curves_as_geojson(27.550513, 53.893564, 27.551013, 53.913564)) as curves_count;
