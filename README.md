## Задача

Разработать отображение сплайнов в OpenLayers с сохранением данных в Postgres (PostGIS).

Задача состоит из двух компонентов:

1. Отображение сплайна нативным методом Canvas в OpenLayers
2. Хранение нативно сплайна в PostGIS

Реализовать bezierCurveTo и quadraticCurveTo. В PostGIS метод ST_AsGeoJSON должен уметь возвращать сплайн, а OpenLayers через GeoJSON должен уметь его распарсить и затем отобразить на карте используя Canvas API.

Код на GitHub открытый репозиторий. Инструкция запуска работы.

## Запуск

Запускается три вещи: бд, бэкенд и фронтенд

#### Back-end

```
cd Back-end
...
```

#### Front-end

```
cd Front-end
npm install
npm run dev
```

#### База данных

...

## Структура проекта

```
Back-end/
    db-scripts/             # sql скрипты для базы данных
Front-end/
    src/                    # Основные файлы веб части проекта
    react-openlayers/       # Исходные файлы библиотеки с не очень проработанной документацией
    react-...-readme.md     # README.md файл библиотеки в папке выше
    .gitignore
    package.json
README.md                   # Вы находитесь здесь)
вопросы.md
```

## Технологии

```
Typescript
React
    react-openlayers        # ещё под вопросом
Tailwind
python
    flask
    ???                     # мост в postgre
PostgreSQL
    PostGIS
```

## Решение
