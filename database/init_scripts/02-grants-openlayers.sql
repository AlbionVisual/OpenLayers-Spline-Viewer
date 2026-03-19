grant select, insert, update, delete on figures to openlayers;
grant usage, select on sequence figures_id_seq to openlayers;
grant execute on function get_all_figures_as_geojson(float8, float8, float8, float8) to openlayers;
grant execute on function get_all_curves_as_geojson(float8, float8, float8, float8) to openlayers;
