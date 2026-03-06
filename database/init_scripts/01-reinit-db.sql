create extension if not exists postgis;

drop table if exists figures;
create table figures (
    id serial primary key,
    geom geometry(Curve, 4326)
);