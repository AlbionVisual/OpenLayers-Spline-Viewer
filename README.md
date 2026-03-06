## Задача

Разработать отображение сплайнов в OpenLayers с сохранением данных в Postgres (PostGIS).

Задача состоит из двух компонентов:

1. Отображение сплайна нативным методом Canvas в OpenLayers
2. Хранение нативно сплайна в PostGIS

Реализовать bezierCurveTo и quadraticCurveTo. В PostGIS метод ST_AsGeoJSON должен уметь возвращать сплайн, а OpenLayers через GeoJSON должен уметь его распарсить и затем отобразить на карте используя Canvas API.

Код на GitHub открытый репозиторий. Инструкция запуска работы.

## Запуск при помощи Docker

```
docker compose up -d --build
```

## Запуск

Запускаются три вещи: база данных, бэкенд и фронтенд. Затем заходим на url vite dev server и пользуемся.

### Первый запуск

#### База данных

Необходимо инициализировать (реинициализировать) базу данных. Для этого нужно активировать скрипт в `Back-end/db-scripts/reinit-db.sql` в какой-нибудь из баз данных, например:

```
psql -U postgres -c "CREATE DATABASE postgis_test;"
psql -U postgres -d postgis_test -f Back-end/db-scripts/reinit-db.sql
```

В файле `Back-end/.env` нужно установить значение для переменной `DATABASE_URL`. Пример есть в файле `.env.example`. Дефолтные значения (кроме пароля) выглядят так: `DATABASE_URL="postgresql://postgres:password@localhost:5432/postgis_test"`. В качетсве базы данных нужно использовать ту, в которой исполнялся скрипт. Чтобы проверить работу можно запустить сприпт `usage-exanples.sql`, там есть заполнение таблицы случайными кривыми вокруг Минска, а также примеры вызовов функций.

#### Back-end

```bash
cd Back-end
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --reload
```

#### Front-end

```
cd Front-end
npm install
npm run dev
```

### Последующие запуски

_Для бэкенда_:

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

### Обновление после pull

```
psql -U postgres -d postgis_test -f Back-end/db-scripts/reinit-db.sql
```

```
cd Back-end
venv\Scripts\activate
pip install -r requirements.txt
```

```
cd Back-end
source venv/bin/activate
pip install -r requirements.txt
```

```
cd Front-end
npm install
```

## Структура проекта (deprecated)

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
        DataLoader.tsx      # Загрузка и предобработка данных. Тут же есть debounce
        MapComponent.tsx    # Компонент, в котором происходит магия визуализации. Тут всё, что связано с отображением
        MapController.tsx   # Компонент, который собирает работу двух файлов вместе
    App.tsx
    react-openlayers/       # Исходные файлы библиотеки с не очень проработанной документацией
    react-...-readme.md     # README.md файл библиотеки в папке выше
    .gitignore
    package.json
README.md                   # Вы находитесь здесь)
```

## Технологии (deprecated)

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

### PostGIS

#### Перекомпиляция

```bash
make -j$(nproc)
sudo make install
sudo service postgresql restart
```

#### Тест

```bash
psql
```

```sql
SELECT ST_GeomFromGeoJSON('{"type":"Curve","coordinates":[[0,0],[1,1],[2,2]]}'); -- цифры в начале кодируют тип. 0102 это LineString, если это встретилось, то недоработка / ошибка, значит Curve не определился или неправильно сохранился. Если 0110 или 0116 не помню (главное, что не 0102), то всё норм.

CREATE TABLE if not exists test_curve AS SELECT 1 as id, ST_GeomFromGeoJSON('{"type":"Curve","coordinates":[[0,0],[5,5],[10,0]]}') as geom; -- хранение данных в виде geometry
 
SELECT id, ST_GeometryType(geom), ST_AsText(geom) FROM test_curve; -- смотрим, чтобы Curve отображался как Curve, а не другой тип

SELECT  -- это не работает, т.е. длинну как в LineString мы не увидим
    ST_Length(geom), 
    ST_AsText(ST_Envelope(geom)) as bbox 
FROM (SELECT ST_GeomFromGeoJSON('{"type":"Curve","coordinates":[[0,0],[1,1]]}') as geom) as t;
```

#### Структура

Используемые файлы:
database/postgis_source/postgis/lwgeom_inout.c
database/postgis_source/liblwgeom/lwin_wkt_parse.c
database/postgis_source/liblwgeom/lwin_wkt.c
database/postgis_source/liblwgeom/lwgeom.c
database/postgis_source/liblwgeom/gserialized.c
database/postgis_source/liblwgeom/liblwgeom.h.in
database/postgis_source/postgis/lwgeom_functions_basic.c
database/postgis_source/liblwgeom/lwgeom_geos.c
database/postgis_source/liblwgeom/lwout_geojson.c
database/postgis_source/liblwgeom/lwout_wkt.c

### Хранение

Храним в виде таблицы со столбцами:
t - curve_type as ENUM ('bezier', 'quadratic')
с - curve (набор четырёх точек, которые потом будут передаваться в функцию отрисовки в этом же порядке)
geom_search - индексируемый столбец, который вычисляется, как linestring от c (тут есть проблема 1 описанная ниже)

Четвёртая точка может быть null, тогда t должен быть 'quadratic', иначе 'bezier'.

Для извлечения и записи данных есть функции:
insert_biezer_curve(p0_x,p0_y,p1_x,p1_y,p2_x,p2_y,p3_x,p3_y)
insert_quadratic_curve(p0_x,p0_y,p1_x,p1_y,p2_x,p2_y,p3_x,p3_y)
get_all_curves_in_bounds(min_lon,min_lat,max_lon,max_lat)
get_all_curves_as_geojson(min_lon,min_lat,max_lon,max_lat)
Последняя функция использует приведение при помощи ST_AsGeoJSON объектов типа curve.

### Бэкенд (мост)

Мост из бд на фронт. Делает область немного шире, чтобы вернуть больше линий (иначе получится приуменьшение количества линий, пока бд не умеет определять точный bbox по точкам). Также оборачивает полученный из бд массив в правильную форму GeoJSON.

Передаём данные в виде стандартного GeoJSON, с добавлением новой "фичи" вида:

```json
{
  "type": "Feature",
  "geometry": {
    "type": "BezierCurve",
    "coordinates": [
      [1.1, 1.2],
      [1.1, 1.2],
      [1.1, 1.2],
      [1.1, 1.2]
    ]
  }
}
```

В качестве типа фигуры есть два добавленных варианта: `BezierCurve` и `QuadraticCurve`.

### Фронтенд

Мы получаем данные в формате GeoJSON, парсим их, ищем данные с нашим типом "сплайн" (точнее должны искать... пока отображаются все пришедшие данные). Эти данные мы запихиваем в features, а затем передаём в качестве фич в VectorSource. Также в style для VectorLayer мы передаём кастомную функцию рендера всех сплайнов.

## Проблемы

### 6. Библиотечность решения

В main.tsx написан js-код, который использует "библиотеку", созданную мною. По хорошему убрать пример, сделать билд и отдельный проект для примера работы решения. В теории для этого достаточно убрать код после комментария "пример исопльзования", сделать билд того, что есть, переложить результат в другой проект в качестве зависимости и исползьовать с тем кодом, который был вырезан.

Решение теперь позволяет создавать несколько слоёв, правда разнится они могут пока только в источнике данных. Внутри до сих пор используется react.
