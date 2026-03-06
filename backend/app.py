import os
from pathlib import Path
from dotenv import load_dotenv
from io import StringIO

BASE_DIR = Path(__file__).parent
env_path = BASE_DIR / '.env'

if env_path.exists():
    with open(env_path, 'r', encoding='utf-8-sig') as f:
        env_content = f.read()
    load_dotenv(stream=StringIO(env_content), override=True)
else:
    load_dotenv(dotenv_path=env_path)

# ^-- костыльный способ прочитать странную кодировку .env файла

import math
import random

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError(
        "DATABASE_URL не установлен! Пожалуйста, создайте файл .env в папке Back-end "
        "и добавьте строку: DATABASE_URL=postgresql://postgres:password@localhost:5432/postgis_test"
    )

import asyncpg
from quart import Quart, Response, jsonify, request
from quart_cors import cors

app = Quart(__name__)
app = cors(app, allow_origin="*")

async def create_db_pool():
    return await asyncpg.create_pool(DATABASE_URL)

@app.before_serving
async def initialize():
    app.db_pool = await create_db_pool()

screen_bbox_offset = 0.005
# max_square = 0.0085
max_square = 0.019

@app.route("/curves")
async def get_all_curves():
    min_lon = request.args.get('min_lon', type=float) - screen_bbox_offset
    min_lat = request.args.get('min_lat', type=float) - screen_bbox_offset
    max_lon = request.args.get('max_lon', type=float) + screen_bbox_offset
    max_lat = request.args.get('max_lat', type=float) + screen_bbox_offset
    square = (max_lon - min_lon) * (max_lat - min_lat)
    # print(min_lon, min_lat, max_lon, max_lat, square)
    # if square > max_square:
    #     return Response("{\"type\":\"FeatureCollection\",\"features\":[]}", mimetype="application/json")
    async with app.db_pool.acquire() as conn:
        try:
            json_str = await conn.fetchval(
                "SELECT * from get_all_curves_as_geojson($1::float8, $2::float8, $3::float8, $4::float8)",
                min_lon,
                min_lat,
                max_lon,
                max_lat,
            )
        except Exception as e:
            return jsonify({"error": str(e)}), 500
        if len(json_str) <= len("{\"type\" : \"FeatureCollection\", \"features\":[]}") + 5:
            mess, code = await create_test_curves_function()
            if code != 200:
                print("ERROR CREATEING",mess, code)

        return Response(json_str, mimetype="application/json")
    
@app.route("/create_test_curves")
async def create_test_curves():
    return await create_test_curves_function()

async def create_test_curves_function():
    print("Creating test curves")
    async with app.db_pool.acquire() as conn:
        try:
            center_lon = 27.550013
            center_lat = 53.903564
            min_radius_km = 0.5
            max_radius_km = 10.0
            radius_ratio = 2.5
            amount = 300
            arc_degrees = 90.0

            km_per_deg_lat = 111.0
            km_per_deg_lon = km_per_deg_lat * math.cos(math.radians(center_lat))

            for _ in range(amount):
                radius_km = min_radius_km + random.random() * (max_radius_km - min_radius_km)
                radius_lat_deg = radius_km / km_per_deg_lat
                radius_lon_deg = radius_km / km_per_deg_lon * radius_ratio
                start_angle = random.random() * 360.0

                if random.random() < 0.5:
                    # Quadratic curve (3 points)
                    angle_rad = math.radians(start_angle)
                    p0_lon = center_lon + radius_lon_deg * math.cos(angle_rad)
                    p0_lat = center_lat + radius_lat_deg * math.sin(angle_rad)

                    angle_rad = math.radians(start_angle + arc_degrees / 4.0)
                    p1_lon = center_lon + radius_lon_deg * math.cos(angle_rad)
                    p1_lat = center_lat + radius_lat_deg * math.sin(angle_rad)

                    angle_rad = math.radians(start_angle + arc_degrees / 2.0)
                    p2_lon = center_lon + radius_lon_deg * math.cos(angle_rad)
                    p2_lat = center_lat + radius_lat_deg * math.sin(angle_rad)

                    await conn.execute(
                        """
                        INSERT INTO figures (geom)
                        VALUES (
                            ST_GeomFromGeoJSON(
                                json_build_object(
                                    'type', 'Curve',
                                    'coordinates', 
                                    json_build_array(
                                        json_build_array($1::float8, $2::float8),
                                        json_build_array($3::float8, $4::float8),
                                        json_build_array($5::float8, $6::float8)
                                    )
                                )::text
                            )
                        )
                        """,
                        p0_lon, p0_lat, p1_lon, p1_lat, p2_lon, p2_lat
                    )
                else:
                    # Bezier curve (4 points)
                    angle_rad = math.radians(start_angle)
                    p0_lon = center_lon + radius_lon_deg * math.cos(angle_rad)
                    p0_lat = center_lat + radius_lat_deg * math.sin(angle_rad)

                    angle_rad = math.radians(start_angle + arc_degrees / 3.0)
                    p1_lon = center_lon + radius_lon_deg * math.cos(angle_rad)
                    p1_lat = center_lat + radius_lat_deg * math.sin(angle_rad)

                    angle_rad = math.radians(start_angle + 2.0 * arc_degrees / 3.0)
                    p2_lon = center_lon + radius_lon_deg * math.cos(angle_rad)
                    p2_lat = center_lat + radius_lat_deg * math.sin(angle_rad)

                    angle_rad = math.radians(start_angle + arc_degrees)
                    p3_lon = center_lon + radius_lon_deg * math.cos(angle_rad)
                    p3_lat = center_lat + radius_lat_deg * math.sin(angle_rad)

                    await conn.execute(
                        """
                        INSERT INTO figures (geom)
                        VALUES (
                            ST_GeomFromGeoJSON(
                                json_build_object(
                                    'type', 'Curve',
                                    'coordinates', 
                                    json_build_array(
                                        json_build_array($1::float8, $2::float8),
                                        json_build_array($3::float8, $4::float8),
                                        json_build_array($5::float8, $6::float8),
                                        json_build_array($7::float8, $8::float8)
                                    )
                                )::text
                            )
                        )
                        """,
                        p0_lon, p0_lat, p1_lon, p1_lat, p2_lon, p2_lat, p3_lon, p3_lat
                    )
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    return jsonify({"message": "Test curves created"}), 200

@app.errorhandler(500)
async def internal_server_error(e):
    return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)