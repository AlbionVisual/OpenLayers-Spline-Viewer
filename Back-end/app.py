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
from quart import Quart, jsonify

app = Quart(__name__)

async def create_db_pool():
    return await asyncpg.create_pool(DATABASE_URL)

@app.before_serving
async def initialize():
    app.db_pool = await create_db_pool()

@app.route("/users")
async def get_users():
    async with app.db_pool.acquire() as conn:
        rows = await conn.fetch("SELECT name, population FROM cities")
        users = [{"name": row["name"], "population": row["population"]} for row in rows]
        return jsonify(users)

@app.route("/users/add/<name>")
async def add_user(name):
    async with app.db_pool.acquire() as conn:
        try:
            await conn.execute("INSERT INTO users(name) VALUES($1)", name)
            return jsonify({"status": "ok"})
        except Exception as e:
            return jsonify({"status": "error", "message": str(e)})

@app.errorhandler(500)
async def internal_server_error(e):
    return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)