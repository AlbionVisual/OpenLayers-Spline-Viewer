SELECT postgis_full_version();

drop function if exists insert_biezer_curve;
drop function if exists insert_quadratic_curve;
drop function if exists get_all_curves_as_geojson(float, float, float, float);
drop function if exists get_all_curves_as_geojson(geometry(Polygon,4326));
drop function if exists get_all_curves_in_bounds(float, float, float, float);
drop function if exists get_all_curves_in_bounds(geometry(Polygon,4326));
drop function if exists ST_AsGeoJSON(curve);
drop table if exists curves;
drop type if exists curve_type;
drop type if exists curve;

create type curve_type as ENUM ('quadratic','bezier');

create type curve as (
    p0 geometry,
    p1 geometry,
    p2 geometry,
    p3 geometry
);

create table curves(
    id bigserial PRIMARY KEY,
    t curve_type not null,
    c curve not null,
    geom_search geometry(LineString,4326) generated always as (
        case
            when t = 'quadratic' then ST_MakeLine(ARRAY[(c).p0, (c).p1, (c).p2])
            when t = 'bezier' then ST_MakeLine(ARRAY[(c).p0, (c).p1, (c).p2, (c).p3])
            else null
        end
    ) stored,
    constraint check_curve_type check (
        (
            (t = 'quadratic' and (c).p3 is null) or
            (t = 'bezier' and (c).p3 is not null)
        )
        and (c).p0 is not null
        and (c).p1 is not null
        and (c).p2 is not null
    )
);

create index curves_geom_search_gist on curves using GIST (geom_search);

create or replace function insert_biezer_curve(
    p0_lon float8, p0_lat float8,
    p1_lon float8, p1_lat float8,
    p2_lon float8, p2_lat float8,
    p3_lon float8, p3_lat float8
) returns bigint as $$
declare
    new_id bigint;
begin
    insert into curves (t, c)
    values (
        'bezier',
        ROW(
            ST_SetSRID(ST_MakePoint(p0_lon, p0_lat), 4326),
            ST_SetSRID(ST_MakePoint(p1_lon, p1_lat), 4326),
            ST_SetSRID(ST_MakePoint(p2_lon, p2_lat), 4326),
            ST_SetSRID(ST_MakePoint(p3_lon, p3_lat), 4326)
        )
    )
    returning id into new_id;

    return new_id;
end;
$$ language plpgsql;

create or replace function insert_quadratic_curve(
    p0_lon float8, p0_lat float8,
    p1_lon float8, p1_lat float8,
    p2_lon float8, p2_lat float8
) returns bigint as $$
declare
    new_id bigint;
begin
    insert into curves (t, c)
    values (
        'quadratic',
        row(
            ST_SetSRID(ST_MakePoint(p0_lon, p0_lat), 4326),
            ST_SetSRID(ST_MakePoint(p1_lon, p1_lat), 4326),
            ST_SetSRID(ST_MakePoint(p2_lon, p2_lat), 4326),
            null
        )
    )
    returning id into new_id;

    return new_id;
end;
$$ language plpgsql;

create or replace function get_all_curves_in_bounds(bbox geometry(Polygon,4326)) returns setof curves as $$
begin
    return query select * from curves where geom_search && bbox and ST_Intersects(geom_search, bbox);
end;
$$ language plpgsql;

create or replace function get_all_curves_in_bounds(
    bbox_lon_min float8, bbox_lat_min float8,
    bbox_lon_max float8, bbox_lat_max float8
) returns setof curves as $$
begin
    return query select * from get_all_curves_in_bounds(ST_MakeEnvelope(bbox_lon_min, bbox_lat_min, bbox_lon_max, bbox_lat_max, 4326));
end;
$$ language plpgsql;

create or replace function ST_AsGeoJSON(curve_instance curve) returns json as $$
declare
    curve_type text := case when curve_instance.p3 is null then 'quadratic' else 'bezier' end;
    coords json;
begin
    if curve_instance.p0 is null or curve_instance.p1 is null or curve_instance.p2 is null then
        raise exception 'Curve points are null';
    end if;

    if curve_instance.p3 is not null then
        coords := json_build_array(
            json_build_array(ST_X(curve_instance.p0), ST_Y(curve_instance.p0)),
            json_build_array(ST_X(curve_instance.p1), ST_Y(curve_instance.p1)),
            json_build_array(ST_X(curve_instance.p2), ST_Y(curve_instance.p2)),
            json_build_array(ST_X(curve_instance.p3), ST_Y(curve_instance.p3))
        );
    else
        coords := json_build_array(
            json_build_array(ST_X(curve_instance.p0), ST_Y(curve_instance.p0)),
            json_build_array(ST_X(curve_instance.p1), ST_Y(curve_instance.p1)),
            json_build_array(ST_X(curve_instance.p2), ST_Y(curve_instance.p2))
        );
    end if;

    return json_build_object(
        'type', 'Feature',
        'geometry', json_build_object(
            'type', 'Point',
            'coordinates', json_build_array(ST_X(curve_instance.p0), ST_Y(curve_instance.p0))
        ),
        'properties', json_build_object(
            'curve_type', curve_type,
            'coords', coords
        )
    );
end;
$$ language plpgsql;

create or replace function get_all_curves_as_geojson(
    bbox_lon_min float8, bbox_lat_min float8,
    bbox_lon_max float8, bbox_lat_max float8
) returns json as $$
begin
    return get_all_curves_as_geojson(ST_MakeEnvelope(bbox_lon_min, bbox_lat_min, bbox_lon_max, bbox_lat_max, 4326));
end;
$$ language plpgsql;

create or replace function get_all_curves_as_geojson(bbox geometry(Polygon,4326)) returns json as $$
declare
    result json;
begin
    select json_agg(ST_AsGeoJSON(g.c)) into result
    from get_all_curves_in_bounds(bbox) as g;

    return coalesce(result, '[]'::json);
end;
$$ language plpgsql;