create extension if not exists postgis;

drop function if exists get_all_curves_as_geojson;

drop table if exists figures;
create table figures (
    id serial primary key,
    geom geometry(Curve, 4326)
);

drop function if exists get_all_curves_as_geojson;
create or replace function get_all_curves_as_geojson(min_lon float8, min_lat float8, max_lon float8, max_lat float8) returns json as $$
begin
    return (
        select json_build_object(
            'type', 'FeatureCollection',
            'features', coalesce(json_agg(
                json_build_object(
                    'type', 'Feature',
                    'geometry', ST_AsGeoJSON(geom)::json
                )
            ), '[]'::json)
        )
        from figures
        where geom && ST_MakeEnvelope(min_lon, min_lat, max_lon, max_lat, 4326)
    );
end;
$$ language plpgsql;

select get_all_curves_as_geojson(0, 0, 10, 10);

insert into figures (geom) values (ST_GeomFromGeoJSON('{"type":"Curve","coordinates":[[0,0],[5,5],[10,0]]}'));