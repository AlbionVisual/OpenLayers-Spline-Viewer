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

## Структура проекта

```
backend/
    app.py                      # главный (единственный) файл бэкенда
    requirements.txt            # список зависимостей
    .env.template               # шаблон переменных окружения
    .gitignore
    dockerfile
    venv/
frontend/
    src/                        # Основные файлы веб части проекта
        components/
            DataLoader.tsx      # Загрузка и предобработка данных. Тут же есть debounce
            MapComponent.tsx    # Компонент, в котором происходит магия визуализации. Тут всё, что связано с отображением
            MapController.tsx   # Компонент, который собирает работу двух файлов вместе
        main.tsx
    .gitignore
    dockerfile
    package.json
docker-compose.yml
.env
README.md                       # Вы находитесь здесь)
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
    C                       # Зависимости исходного кода postgis
    flex
    bison
```

## Решение

### БД

Одна показательная таблица и извлекающий метод... и больше ничего. Всё заполняет бэкенд, а потом сам передаёт дальше.

### PostGIS

Все дополнения / изменения помечены комментариями вида:
```
// AlbionVisual2026
```
Можно сделать поиск по проекту по этой строке. Всего около 100 мест с изменениями для создания одного типа Curve, являющегося почти полной копией LineString.

Добавлены имя в системе, методы экспорта, импорта из json / памяти / буфера. Осталось использование структуры LWLINE в качестве основной для кривой (вся сверка идёт по полю LWLINE->type, который переустанавливается везде где нужно на CurveType, поэтому большую часть логики LineString копировать не пришлось), а также нету ограничения на количество точек, поэтому любое слово LineString в теории можно заменить на Curve.

### Бэкенд

Мост из бд на фронт. Делает область немного шире, чтобы вернуть больше линий (иначе получится приуменьшение количества линий, пока бд не умеет определять точный bbox по точкам). Также заполняет бд, если в таблице нету никакой информации.

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

В качестве типа фигуры есть три добавленных варианта: `BezierCurve`, `QuadraticCurve` и `Curve`. Только с последним знаком postgis пока что.

PostGis знает пока только Curve - это почти полная копия LineString (нет ограничений на количество точек, нельзя использовать wkt для создания типа, можно использовать geojson с `"type": "Curve"`, работает определение пересечения с областью точно также как и в LineString, не работает ST_Length).

### Фронтенд

Мы получаем данные в формате GeoJSON, парсим их, ищем данные с нашим типом "сплайн" (точнее должны искать... пока отображаются все пришедшие данные). Эти данные мы запихиваем в features, а затем передаём в качестве фич в VectorSource. Также в style для VectorLayer мы передаём кастомную функцию рендера всех сплайнов.


## Запуск по-отдельности

Компилируются три вещи: плагин postgis для postgresql и копируется в директорию плагинов postgre, бэкенд и фронтенд. Затем запускаются три сервера / службы, а дальше можно зайти на url vite dev server и пользоваться.

### Первый запуск

#### 1. Компиляция PostGIS

Установка пакетов может разниться в зависимости от дистрибутивов 
```bash
apt-get update && apt-get install -y \
    build-essential autoconf automake libtool \
    bison flex libxml2-dev libgeos-dev libproj-dev \
    libgdal-dev libjson-c-dev postgresql-server-dev-16 \
./autogen.sh
./configure --without-protobuf
make -j$(nproc)
make install
```

#### 2. База данных

Необходимо инициализировать (реинициализировать) базу данных. Для этого нужно активировать скрипт `database/init_scripts/01-reinit-db.sql` в какой-нибудь из баз данных, например:

```
psql -U postgres -c "CREATE DATABASE postgis_test;"
psql -U postgres -d postgis_test -f database/init_scripts/01-reinit-db.sql
```

В файле `backend/.env` нужно установить значение для переменной `DATABASE_URL`. Пример есть в файле `.env.example`. Дефолтные значения (кроме пароля) выглядят так: `DATABASE_URL="postgresql://postgres:password@localhost:5432/postgis_test"`. В качетсве базы данных нужно использовать ту, в которой исполнялся скрипт.

#### 3. Back-end

```bash
cd Back-end
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --reload
```

#### 4. Front-end

```
cd Front-end
npm install
npm run dev
```

### Компиляция при изменении

1. PostGIS:
    ```bash
    make -j$(nproc)
    make install
    ```
    Полезно иногда перезагружать postgresql как службу: `sudo service postgresql restart`
2+. Остальное перекомпилируется на лету прямо при изменениях.

### Последующие запуски

1. Backend
    ```
    cd Back-end
    source venv/bin/activate
    uvicorn app:app --reload
    ```
2. Frontend
    ```
    cd Front-end
    npm run dev
    ```

### Проверка работы

#### Postgis

```bash
sudo su - postgres
psql
```

```sql
SELECT ST_GeomFromGeoJSON('{"type":"Curve","coordinates":[[0,0],[1,1],[2,2]]}'); -- цифры в начале кодируют тип. 0102 это LineString, если это встретилось, то недоработка / ошибка, значит Curve не определился или неправильно сохранился. Если 0110 или 0116 не помню (главное, что не 0102), то всё норм.
```

```sql
CREATE TABLE if not exists test_curve AS SELECT 1 as id, ST_GeomFromGeoJSON('{"type":"Curve","coordinates":[[0,0],[5,5],[10,0]]}') as geom; -- хранение данных в виде geometry
 ```

```sql
SELECT id, ST_GeometryType(geom), ST_AsText(geom) FROM test_curve; -- смотрим, чтобы Curve отображался как Curve, а не другой тип
```

```sql
SELECT  -- это не работает, т.е. длинну как в LineString мы не увидим
    ST_Length(geom), 
    ST_AsText(ST_Envelope(geom)) as bbox 
FROM (SELECT ST_GeomFromGeoJSON('{"type":"Curve","coordinates":[[0,0],[1,1]]}') as geom) as t;
```

#### Backend

Дозаполнить случайными данными вокруг Минска:

```bash
curl "http://localhost:8000/create_test_curves"
```

Извлечение данных для теста выше:

```bash
curl "http://localhost:8000/curves?min_lon=27&min_lat=53&max_lon=28&max_lat=54.5"
```

Извлечение данных для теста из PostGis:

```bash
curl "http://localhost:8000/curves?min_lon=0.1&min_lat=0.1&max_lon=10&max_lat=10"
```

## Проблемы / вопросы

### 8. Уточнение требований по фронтенд-решению

Требуется ли сделать очень похожую функциональность слоёв для нового слоя кривых (т.е. по сути сделать аналог VectorLayer для кривых, с возможностью передачи Fetures и других данных)?

Есть ещё идеи: передавать в слой массив Features и отображать только с типом Curve; передавать в слой массив Features и отображать всё, в том числе и кривые (дополнение векторного слоя). 

### 9. Архитектура нового PostGis

Мы добавляем новый тип - кривая. Нужно ли тратить время на безопасномть (выбрасывать ошибки, если вставлено не 3-4 точки; возможно нужно проверять ещё не одинаковость точек)? Нужно ли делить один тип "Curve", который уже сделан, на два "BezierCurve" и "QuadraticCurve" (как будто это можно делать только для того, чтобы не разрешать писать некорректное число точек в json, в остальном хранение идентичное)?

### 10. Задача поиска пересечения

Ещё была нетронута часть поиска пересечения области с кривой, она по умолчанию использует функцию для LineString. Это отдельная задача, которую можно решить разными методами, задача здесь сделать, чтобы работало точно / красиво, или потратить время и перебрать разные методы для нахождения наилучшего? Возможно есть предел производительности, которого нужно достигнуть?