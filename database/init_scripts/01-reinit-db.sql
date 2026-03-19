create extension if not exists postgis;

drop function if exists get_all_curves_as_geojson(float8, float8, float8, float8);
drop function if exists get_all_figures_as_geojson(float8, float8, float8, float8);

drop table if exists figures;
create table figures (
    id serial primary key,
    geom geometry(Geometry, 4326)
);

create or replace function get_all_figures_as_geojson(min_lon float8, min_lat float8, max_lon float8, max_lat float8) returns json as $$
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

create or replace function get_all_curves_as_geojson(min_lon float8, min_lat float8, max_lon float8, max_lat float8) returns json as $curves$
begin
    return get_all_figures_as_geojson(min_lon, min_lat, max_lon, max_lat);
end;
$curves$ language plpgsql;

do $grants$
begin
    if exists (select 1 from pg_roles where rolname = 'openlayers') then
        grant select, insert, update, delete on figures to openlayers;
        grant usage, select on sequence figures_id_seq to openlayers;
        grant execute on function get_all_figures_as_geojson(float8, float8, float8, float8) to openlayers;
        grant execute on function get_all_curves_as_geojson(float8, float8, float8, float8) to openlayers;
    end if;
end
$grants$;

select get_all_figures_as_geojson(0, 0, 10, 10);
