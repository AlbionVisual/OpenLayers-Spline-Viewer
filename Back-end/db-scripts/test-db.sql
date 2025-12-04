-- Активация расширения PostGIS в текущей базе данных
CREATE EXTENSION postgis;
SELECT postgis_full_version();

drop table if exists test;
create table if not exists test (
	id int primary key,
	name varchar(50)
);