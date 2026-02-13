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
    prefix = '{"type":"FeatureCollection","features":'
    if square > max_square:
        return Response(prefix + "[]}", mimetype="application/json")
    async with app.db_pool.acquire() as conn:
        try:
            json_str = await conn.fetchval(
                "SELECT get_all_curves_as_geojson($1, $2, $3, $4)",
                min_lon,
                min_lat,
                max_lon,
                max_lat,
            )
        except Exception as e:
            return jsonify({"error": str(e)}), 500

        body = json_str or "[]"
        # print(len(body))
        return Response(prefix + body + "}", mimetype="application/json")

@app.errorhandler(500)
async def internal_server_error(e):
    return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)