По некоторым вещам возникли вопросы. Правильно ли я сделал исправление?

```с
// liblwgeom/lwutil.c
...
/* Structure for the type array */
struct geomtype_struct
{
	char *typename;
	int type;
	int z;
	int m;
};

/* Type array. Note that the order of this array is important in
   that any typename in the list must *NOT* occur within an entry
   before it. Otherwise if we search for "POINT" at the top of the
   list we would also match MULTIPOINT, for example. */

struct geomtype_struct geomtype_struct_array[] =
{
	{ "GEOMETRYCOLLECTIONZM", COLLECTIONTYPE, 1, 1 },
	{ "GEOMETRYCOLLECTIONZ", COLLECTIONTYPE, 1, 0 },
	{ "GEOMETRYCOLLECTIONM", COLLECTIONTYPE, 0, 1 },
	{ "GEOMETRYCOLLECTION", COLLECTIONTYPE, 0, 0 },

	{ "GEOMETRYZM", 0, 1, 1 },
	{ "GEOMETRYZ", 0, 1, 0 },
	{ "GEOMETRYM", 0, 0, 1 },
	{ "GEOMETRY", 0, 0, 0 },

	{ "POLYHEDRALSURFACEZM", POLYHEDRALSURFACETYPE, 1, 1 },
	{ "POLYHEDRALSURFACEZ", POLYHEDRALSURFACETYPE, 1, 0 },
	{ "POLYHEDRALSURFACEM", POLYHEDRALSURFACETYPE, 0, 1 },
	{ "POLYHEDRALSURFACE", POLYHEDRALSURFACETYPE, 0, 0 },

	{ "TINZM", TINTYPE, 1, 1 },
	{ "TINZ", TINTYPE, 1, 0 },
	{ "TINM", TINTYPE, 0, 1 },
	{ "TIN", TINTYPE, 0, 0 },

	{ "CIRCULARSTRINGZM", CIRCSTRINGTYPE, 1, 1 },
	{ "CIRCULARSTRINGZ", CIRCSTRINGTYPE, 1, 0 },
	{ "CIRCULARSTRINGM", CIRCSTRINGTYPE, 0, 1 },
	{ "CIRCULARSTRING", CIRCSTRINGTYPE, 0, 0 },

	{ "COMPOUNDCURVEZM", COMPOUNDTYPE, 1, 1 },
	{ "COMPOUNDCURVEZ", COMPOUNDTYPE, 1, 0 },
	{ "COMPOUNDCURVEM", COMPOUNDTYPE, 0, 1 },
	{ "COMPOUNDCURVE", COMPOUNDTYPE, 0, 0 },

	{ "CURVEPOLYGONZM", CURVEPOLYTYPE, 1, 1 },
	{ "CURVEPOLYGONZ", CURVEPOLYTYPE, 1, 0 },
	{ "CURVEPOLYGONM", CURVEPOLYTYPE, 0, 1 },
	{ "CURVEPOLYGON", CURVEPOLYTYPE, 0, 0 },

	{ "MULTICURVEZM", MULTICURVETYPE, 1, 1 },
	{ "MULTICURVEZ", MULTICURVETYPE, 1, 0 },
	{ "MULTICURVEM", MULTICURVETYPE, 0, 1 },
	{ "MULTICURVE", MULTICURVETYPE, 0, 0 },

	{ "MULTISURFACEZM", MULTISURFACETYPE, 1, 1 },
	{ "MULTISURFACEZ", MULTISURFACETYPE, 1, 0 },
	{ "MULTISURFACEM", MULTISURFACETYPE, 0, 1 },
	{ "MULTISURFACE", MULTISURFACETYPE, 0, 0 },

	{ "MULTILINESTRINGZM", MULTILINETYPE, 1, 1 },
	{ "MULTILINESTRINGZ", MULTILINETYPE, 1, 0 },
	{ "MULTILINESTRINGM", MULTILINETYPE, 0, 1 },
	{ "MULTILINESTRING", MULTILINETYPE, 0, 0 },

	{ "MULTIPOLYGONZM", MULTIPOLYGONTYPE, 1, 1 },
	{ "MULTIPOLYGONZ", MULTIPOLYGONTYPE, 1, 0 },
	{ "MULTIPOLYGONM", MULTIPOLYGONTYPE, 0, 1 },
	{ "MULTIPOLYGON", MULTIPOLYGONTYPE, 0, 0 },

	{ "MULTIPOINTZM", MULTIPOINTTYPE, 1, 1 },
	{ "MULTIPOINTZ", MULTIPOINTTYPE, 1, 0 },
	{ "MULTIPOINTM", MULTIPOINTTYPE, 0, 1 },
	{ "MULTIPOINT", MULTIPOINTTYPE, 0, 0 },

	{ "LINESTRINGZM", LINETYPE, 1, 1 },
	{ "LINESTRINGZ", LINETYPE, 1, 0 },
	{ "LINESTRINGM", LINETYPE, 0, 1 },
	{ "LINESTRING", LINETYPE, 0, 0 },

	{ "TRIANGLEZM", TRIANGLETYPE, 1, 1 },
	{ "TRIANGLEZ", TRIANGLETYPE, 1, 0 },
	{ "TRIANGLEM", TRIANGLETYPE, 0, 1 },
	{ "TRIANGLE", TRIANGLETYPE, 0, 0 },

	{ "POLYGONZM", POLYGONTYPE, 1, 1 },
	{ "POLYGONZ", POLYGONTYPE, 1, 0 },
	{ "POLYGONM", POLYGONTYPE, 0, 1 },
	{ "POLYGON", POLYGONTYPE, 0, 0 },

	{ "POINTZM", POINTTYPE, 1, 1 },
	{ "POINTZ", POINTTYPE, 1, 0 },
	{ "POINTM", POINTTYPE, 0, 1 },
	{ "POINT", POINTTYPE, 0, 0 },

    // AlbionVisual2026
    { "CURVEZM", CURVETYPE, 1, 1 },
    { "CURVEZ", CURVETYPE, 1, 0 },
    { "CURVEM", CURVETYPE, 0, 1 },
    { "CURVE", CURVETYPE, 0, 0 }

};
#define GEOMTYPE_STRUCT_ARRAY_LEN (sizeof geomtype_struct_array/sizeof(struct geomtype_struct))
...
```

```flex
// lwin_wkt_parse.y
...
%%

geometry:
	geometry_no_srid
		{ wkt_parser_geometry_new($1, SRID_UNKNOWN); WKT_ERROR(); } |
	SRID_TOK SEMICOLON_TOK geometry_no_srid
		{ wkt_parser_geometry_new($3, $1); WKT_ERROR(); } ;

geometry_no_srid :
	point { $$ = $1; } |
	linestring { $$ = $1; } |
	circularstring { $$ = $1; } |
	compoundcurve { $$ = $1; } |
	polygon { $$ = $1; } |
	curvepolygon { $$ = $1; } |
	multipoint { $$ = $1; } |
	multilinestring { $$ = $1; } |
	multipolygon { $$ = $1; } |
	multisurface { $$ = $1; } |
	multicurve { $$ = $1; } |
	tin { $$ = $1; } |
	polyhedralsurface { $$ = $1; } |
	triangle { $$ = $1; } |
	geometrycollection { $$ = $1; } |
    // AlbionVisual2026
    curve { $$ = $1; } ;

geometrycollection :
	COLLECTION_TOK LBRACKET_TOK geometry_list RBRACKET_TOK
		{ $$ = wkt_parser_collection_finalize(COLLECTI...
```

```h
// liblwgeom/lwin_wkt.h
// По этому инструкций не было, но я предположил, что при создании новой функции, нужно будет добавиьт её и в .h файл:

/*
* Functions called from within the bison parser to construct geometries.
*/
int32_t wkt_lexer_read_srid(char *str);
POINT wkt_parser_coord_2(double c1, double c2);
POINT wkt_parser_coord_3(double c1, double c2, double c3);
POINT wkt_parser_coord_4(double c1, double c2, double c3, double c4);
POINTARRAY* wkt_parser_ptarray_add_coord(POINTARRAY *pa, POINT p);
POINTARRAY* wkt_parser_ptarray_new(POINT p);
LWGEOM* wkt_parser_point_new(POINTARRAY *pa, char *dimensionality);
LWGEOM* wkt_parser_linestring_new(POINTARRAY *pa, char *dimensionality);
// AlbionVisual2026
LWGEOM* wkt_parser_curve_new(POINTARRAY *pa, char *dimensionality);

LWGEOM* wkt_parser_circularstring_new(POINTARRAY *pa, char *dimensionality);
LWGEOM* wkt_parser_triangle_new(POINTARRAY *pa, char *dimensionality);
LWGEOM* wkt_parser_polygon_new(POINTARRAY *pa, char dimcheck);
LWGEOM* wkt_parser_polygon_add_ring(LWGEOM *poly, POINTARRAY *pa, char dimcheck);
LWGEOM* wkt_parser_polygon_finalize(LWGEOM *poly, char *dimensionality);
LWGEOM* wkt_parser_curvepolygon_new(LWGEOM *ring);
LWGEOM* wkt_parser_curvepolygon_add_ring(LWGEOM *poly, LWGEOM *ring);
LWGEOM* wkt_parser_curvepolygon_finalize(LWGEOM *poly, char *dimensionality);
LWGEOM* wkt_parser_compound_new(LWGEOM *element);
LWGEOM* wkt_parser_compound_add_geom(LWGEOM *col, LWGEOM *geom);
LWGEOM* wkt_parser_compound_finalize(LWGEOM *col, char *dimensionality);
LWGEOM* wkt_parser_collection_new(LWGEOM *geom);
LWGEOM* wkt_parser_collection_add_geom(LWGEOM *col, LWGEOM *geom);
LWGEOM* wkt_parser_collection_finalize(int lwtype, LWGEOM *col, char *dimensionality);
void wkt_parser_geometry_new(LWGEOM *geom, int32_t srid);


```

```c
// liblwgeom/lwin_wkt.c
// Я не изменял функции, пока оставил так. Я предполагаю, что мне нужно будет полностью переопределить lwline_construct, lwline_as_lwgeom, lwline_construct_empty на curve. Правильно?

/**
* Create a new linestring. Null point array implies empty. Null dimensionality
* implies no specified dimensionality in the WKT. Check for numpoints >= 2 if
* requested.
*/
LWGEOM* wkt_parser_linestring_new(POINTARRAY *pa, char *dimensionality)
{
	lwflags_t flags = wkt_dimensionality(dimensionality);
	LWDEBUG(4,"entered");

	/* No pointarray means it is empty */
	if( ! pa )
		return lwline_as_lwgeom(lwline_construct_empty(SRID_UNKNOWN, FLAGS_GET_Z(flags), FLAGS_GET_M(flags)));

	/* If the number of dimensions is not consistent, we have a problem. */
	if( wkt_pointarray_dimensionality(pa, flags) == LW_FALSE )
	{
		ptarray_free(pa);
		SET_PARSER_ERROR(PARSER_ERROR_MIXDIMS);
		return NULL;
	}

	/* Apply check for not enough points, if requested. */
	if( (global_parser_result.parser_check_flags & LW_PARSER_CHECK_MINPOINTS) && (pa->npoints < 2) )
	{
		ptarray_free(pa);
		SET_PARSER_ERROR(PARSER_ERROR_MOREPOINTS);
		return NULL;
	}

	return lwline_as_lwgeom(lwline_construct(SRID_UNKNOWN, NULL, pa));
}

// AlbionVisual2026
/**
* Create a new curve (AlbionVisual2026) (just copies logic of linestring). Null point array implies empty.
* Null dimensionality implies no specified dimensionality in the WKT. Check for numpoints >= 2 if
* requested.
*/
LWGEOM* wkt_parser_curve_new(POINTARRAY *pa, char *dimensionality)
{
	lwflags_t flags = wkt_dimensionality(dimensionality);
	LWDEBUG(4,"entered");

	/* No pointarray means it is empty */
	if( ! pa )
		return lwline_as_lwgeom(lwline_construct_empty(SRID_UNKNOWN, FLAGS_GET_Z(flags), FLAGS_GET_M(flags)));

	/* If the number of dimensions is not consistent, we have a problem. */
	if( wkt_pointarray_dimensionality(pa, flags) == LW_FALSE )
	{
		ptarray_free(pa);
		SET_PARSER_ERROR(PARSER_ERROR_MIXDIMS);
		return NULL;
	}

	/* Apply check for not enough points, if requested. */
	if( (global_parser_result.parser_check_flags & LW_PARSER_CHECK_MINPOINTS) && (pa->npoints < 2) )
	{
		ptarray_free(pa);
		SET_PARSER_ERROR(PARSER_ERROR_MOREPOINTS);
		return NULL;
	}

	return lwline_as_lwgeom(lwline_construct(SRID_UNKNOWN, NULL, pa));
}
```

```c
// liblwgeom/lwin_wkb.c
// Тут я встретил вот это (нужно ли с этим что-нибудь делать?) (WKB_POINT_TYPE определена не в этом файле) (я ничего тут не добавлял):
static void lwtype_from_wkb_state(wkb_parse_state *s, uint32_t wkb_type)
{
    ...
    switch (wkb_simple_type)
	{
		case WKB_POINT_TYPE:
			s->lwtype = POINTTYPE;
			break;
		case WKB_LINESTRING_TYPE:
			s->lwtype = LINETYPE;
			break;
		case WKB_POLYGON_TYPE:
			s->lwtype = POLYGONTYPE;
			break;
		case WKB_MULTIPOINT_TYPE:
			s->lwtype = MULTIPOINTTYPE;
			break;
		case WKB_MULTILINESTRING_TYPE:
			s->lwtype = MULTILINETYPE;
			break;
		case WKB_MULTIPOLYGON_TYPE:
			s->lwtype = MULTIPOLYGONTYPE;
			break;
		case WKB_GEOMETRYCOLLECTION_TYPE:
			s->lwtype = COLLECTIONTYPE;
			break;
		case WKB_CIRCULARSTRING_TYPE:
			s->lwtype = CIRCSTRINGTYPE;
			break;
		case WKB_COMPOUNDCURVE_TYPE:
			s->lwtype = COMPOUNDTYPE;
			break;
		case WKB_CURVEPOLYGON_TYPE:
			s->lwtype = CURVEPOLYTYPE;
			break;
		case WKB_MULTICURVE_TYPE:
			s->lwtype = MULTICURVETYPE;
			break;
		case WKB_MULTISURFACE_TYPE:
			s->lwtype = MULTISURFACETYPE;
			break;
		case WKB_POLYHEDRALSURFACE_TYPE:
			s->lwtype = POLYHEDRALSURFACETYPE;
			break;
		case WKB_TIN_TYPE:
			s->lwtype = TINTYPE;
			break;
		case WKB_TRIANGLE_TYPE:
			s->lwtype = TRIANGLETYPE;
			break;

		/* PostGIS 1.5 emits 13, 14 for CurvePolygon, MultiCurve */
		/* These numbers aren't SQL/MM (numbers currently only */
		/* go up to 12. We can handle the old data here (for now??) */
		/* converting them into the lwtypes that are intended. */
		case WKB_CURVE_TYPE:
			s->lwtype = CURVEPOLYTYPE;
			break;
		case WKB_SURFACE_TYPE:
			s->lwtype = MULTICURVETYPE;
			break;

		default: /* Error! */
			lwerror("Unknown WKB type (%d)! Full WKB type number was (%d).", wkb_simple_type, wkb_type);
			break;
	}
    ...
}

...
// фнукции lwgeom_read_wkb_header нету, 
LWGEOM* lwgeom_from_wkb_state(wkb_parse_state *s)
{
    ...

    /* Do the right thing */
	switch( s->lwtype )
	{
        case POINTTYPE:
            return (LWGEOM*)lwpoint_from_wkb_state(s);
            break;
		case LINETYPE:
            return (LWGEOM*)lwline_from_wkb_state(s);
            break;
        // AlbionVisual2026
        case CURVETYPE: // 16
            LWGEOM* lwgeom = (LWGEOM*)lwline_from_wkb_state(s);
            if (lwgeom) lwgeom->type = CURVETYPE;
            break;
		case CIRCSTRINGTYPE:
			return (LWGEOM*)lwcircstring_from_wkb_state(s);
			break;
		case POLYGONTYPE:
			return (LWGEOM*)lwpoly_from_wkb_state(s);
			break;
		case TRIANGLETYPE:
			return (LWGEOM*)lwtriangle_from_wkb_state(s);
			break;
		case CURVEPOLYTYPE:
			return (LWGEOM*)lwcurvepoly_from_wkb_state(s);
			break;
		case MULTIPOINTTYPE:
		case MULTILINETYPE:
		case MULTIPOLYGONTYPE:
		case COMPOUNDTYPE:
		case MULTICURVETYPE:
		case MULTISURFACETYPE:
		case POLYHEDRALSURFACETYPE:
		case TINTYPE:
		case COLLECTIONTYPE:
			return (LWGEOM*)lwcollection_from_wkb_state(s);
			break;

		/* Unknown type! */
		default:
			lwerror("%s: Unsupported geometry type: %s", __func__, lwtype_name(s->lwtype));
	}

	/* Return value to keep compiler happy. */
	return NULL;
}
```

```c
// liblwgeom/lwout_wkb.c

...
/*
* GeometryType
*/
static uint32_t lwgeom_wkb_type(const LWGEOM *geom, uint8_t variant)
{
	uint32_t wkb_type = 0;

	switch ( geom->type )
	{
	case POINTTYPE:
		wkb_type = WKB_POINT_TYPE;
		break;
	case LINETYPE:
		wkb_type = WKB_LINESTRING_TYPE;
		break;
    // AlbionVisual2026
    case CURVETYPE:
        WKB_WRITE_INT(geom->type); 
		wkb_type = WKB_LINESTRING_TYPE;
		break;
	case POLYGONTYPE:
		wkb_type = WKB_POLYGON_TYPE;
		break;
	case MULTIPOINTTYPE:
		wkb_type = WKB_MULTIPOINT_TYPE;
		break;
	case MULTILINETYPE:
		wkb_type = WKB_MULTILINESTRING_TYPE;
		break;
    ...
    }
    ...
}
...

```

```h
// liblwgeom/liblwgeom_internal.h
// Тут создаются переменные, которые будут потом исползьоваться. Мне нужно здесь создвть свой тип кривая, использовать тот, что тут задан, или полностью скопировать то, что выдаёт для LineString?

...
/**
* Well-Known Binary (WKB) Geometry Types
*/
#define WKB_POINT_TYPE 1
#define WKB_LINESTRING_TYPE 2
#define WKB_POLYGON_TYPE 3
#define WKB_MULTIPOINT_TYPE 4
#define WKB_MULTILINESTRING_TYPE 5
#define WKB_MULTIPOLYGON_TYPE 6
#define WKB_GEOMETRYCOLLECTION_TYPE 7
#define WKB_CIRCULARSTRING_TYPE 8
#define WKB_COMPOUNDCURVE_TYPE 9
#define WKB_CURVEPOLYGON_TYPE 10
#define WKB_MULTICURVE_TYPE 11
#define WKB_MULTISURFACE_TYPE 12
#define WKB_CURVE_TYPE 13 /* from ISO draft, not sure is real */
#define WKB_SURFACE_TYPE 14 /* from ISO draft, not sure is real */
#define WKB_POLYHEDRALSURFACE_TYPE 15
#define WKB_TIN_TYPE 16
#define WKB_TRIANGLE_TYPE 17
...
```

