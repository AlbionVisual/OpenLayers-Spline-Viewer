## Задача

Разработать отображение сплайнов в OpenLayers с сохранением данных в Postgres (PostGIS).

Задача состоит из двух компонентов:

1. Отображение сплайна нативным методом Canvas в OpenLayers
2. Хранение нативно сплайна в PostGIS

Реализовать bezierCurveTo и quadraticCurveTo. В PostGIS метод ST_AsGeoJSON должен уметь возвращать сплайн, а OpenLayers через GeoJSON должен уметь его распарсить и затем отобразить на карте используя Canvas API.

Код на GitHub открытый репозиторий. Инструкция запуска работы.

## Запуск

Запускается три вещи: база данных, бэкенд и фронтенд. Затем заходим на url vite dev server и пользуемся.

#### База данных

Необходимо инициализировать базу данных. Для этого нужно активировать скрипт в `Back-end/db-scripts/init-db.sql` в какой-нибудь из баз данных, например:

```
psql -U postgres -c "CREATE DATABASE postgis_test;"
psql -U postgres -d postgis_test -f Back-end/db-scripts/init-db.sql
```

В файле `Back-end/.env` нужно установить значение для переменной `DATABASE_URL`. Пример есть в файле `.env.example`. Дефолтные значения (кроме пароля) выглядят так: `DATABASE_URL="postgresql://postgres:password@localhost:5432/postgis_test"`. В качетсве базы данных нужно использовать ту, что создали выше.

#### Back-end

_windows_

```
cd Back-end
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app:app --reload
```

_linux_

```
cd Back-end
python -m venv venv
source venv/Scripts/activate
pip install -r requirements.txt
uvicorn app:app --reload
```

#### Front-end

```
cd Front-end
npm install
npm run dev
```

## Последующие запуски

_Для бэкенда_:

```
cd Back-end
venv\Scripts\activate
uvicorn app:app --reload
```

```
cd Back-end
source venv/bin/activate
uvicorn app:app --reload
```

_Для фронтеда_:

```
cd Front-end
npm run dev
```

## Структура проекта

```
Back-end/
    db-scripts/             # sql скрипты для базы данных
    app.py                  # главный файл бэкенда
    requirements.txt        # список зависимостей
    .env.template           # шаблон переменных окружения
    .gitignore
    venv/                   # виртуальное окружение
Front-end/
    src/                    # Основные файлы веб части проекта
    react-openlayers/       # Исходные файлы библиотеки с не очень проработанной документацией
    react-...-readme.md     # README.md файл библиотеки в папке выше
    .gitignore
    package.json
README.md                   # Вы находитесь здесь)
```

## Технологии

```
Typescript
React
    react-openlayers        # react-порт js-библиотеки OpenLayers
Tailwind
python
    Quart
    asyncpg                 # мост в postgres
    uvicorn
PostgreSQL
    PostGIS
```

## Решение
