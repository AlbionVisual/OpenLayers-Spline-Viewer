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

Хранение и возвращение простым бэком в Postgre.

Получение во фронте.

Парсинг данных. Мы получаем данные в формате GeoJSON, парсим их, ищем данные с нашим типом "сплайн". Эти данные мы запихиваем в features при помощи `format.readFeatures(geojsondata);`, а затем передаём в качестве фич в VectorSource. Также в style для VectorLayer мы передаём кастомную функцию рендера всех сплайнов. Кастомная функция пока будет использовать встроенные методы bezierCurveTo и quadraticCurveTo для "нативного изображения сплайнов".

### Подсказки, варианты решения:

**Вариант 1: Кастомный стиль с Canvas renderer**

```typescript
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import { Style, Stroke } from 'ol/style';
import { toContext } from 'ol/render';

const vectorSource = new VectorSource();
const feature = new Feature({
  geometry: new LineString([...])
});

const customStyle = new Style({
  renderer: (coords, state) => {
    const ctx = state.context;
    const pixelRatio = state.pixelRatio;

    ctx.beginPath();
    ctx.moveTo(coords[0][0], coords[0][1]);

    ctx.bezierCurveTo(
      controlPoint1.x, controlPoint1.y,
      controlPoint2.x, controlPoint2.y,
      coords[coords.length - 1][0],
      coords[coords.length - 1][1]
    );

    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
});

<VectorLayer
  source={vectorSource}
  style={customStyle}
/>
```

**Вариант 2: Использование useRef для прямого доступа к карте и добавления Features динамически**

```typescript
import { useRef, useEffect } from "react";
import { useMap } from "react-openlayers";
import VectorSource from "ol/source/Vector";
import Feature from "ol/Feature";
import LineString from "ol/geom/LineString";

function BezierCurveLayer() {
  const map = useMap();
  const sourceRef = useRef(new VectorSource());

  useEffect(() => {
    if (!map) return;

    const source = sourceRef.current;

    const bezierFeature = new Feature({
      geometry: new LineString([
        [-10997148, 4569099],
        [-11000000, 4570000],
        [-10995000, 4571000],
      ]),
    });

    source.addFeature(bezierFeature);

    return () => {
      source.clear();
    };
  }, [map]);

  return <VectorLayer source={sourceRef.current} />;
}
```

**Передаваемые данные могут выглядеть так:**

```JSON
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "LineString", // или специальный тип для сплайна
        "coordinates": [
          [-10997148, 4569099],  // начальная точка
          [-11000000, 4570000],  // контрольная точка 1
          [-11005000, 4571000],  // контрольная точка 2 (для bezierCurveTo)
          [-10995000, 4572000]   // конечная точка
        ]
      },
      "properties": {
        "curveType": "bezier", // или "quadratic"
        "controlPoints": [...] // явное указание контрольных точек
      }
    }
  ]
}
```

**Парсинг пришедшего JSON:**

```Typescript
import GeoJSON from 'ol/format/GeoJSON';

const format = new GeoJSON();
const features = format.readFeatures(geojsonData);
```
