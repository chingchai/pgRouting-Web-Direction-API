const { pool, query } = require('../config/database');
const { config_pg } = require('../config/config');


function distanceQuery(start, end) {
    // ST_GeomFromText('POINT(24.240194 60.008345)', 4326)
    const query = `SELECT * FROM pgr_dijkstra(
        'SELECT id, source, target, cost_len as cost FROM ${config_pg.table}', 
        (SELECT id FROM ${config_pg.vertices_table} ORDER BY st_distance(the_geom, st_setsrid(st_makepoint(${start}), ${config_pg.input_srid})) LIMIT 1), 
        (SELECT id FROM ${config_pg.vertices_table} ORDER BY st_distance(the_geom, st_setsrid(st_makepoint(${end}), ${config_pg.input_srid})) LIMIT 1)
        , false)`;
    return query;
}

function routeQuery(start, end) {
    const query = `
    SELECT *, st_transform(geom, ${config_pg.output_srid}) as geom, st_asgeojson(st_transform(geom, ${config_pg.output_srid})) geojson, st_astext(st_transform(geom, ${config_pg.output_srid})) wkt FROM pgr_dijkstra(
        'SELECT id, source, target, cost_len as cost, rcost_len as reverse_cost FROM ${config_pg.table}', 
        (SELECT id FROM ${config_pg.vertices_table} ORDER BY st_distance(the_geom, st_setsrid(st_makepoint(${start}), ${config_pg.input_srid})) LIMIT 1),
        (SELECT id FROM ${config_pg.vertices_table} ORDER BY st_distance(the_geom, st_setsrid(st_makepoint(${end}), ${config_pg.input_srid})) LIMIT 1),
        false) as dj, ${config_pg.table} as ln where dj.edge=ln."id";`;
    return query;
}

function routeQuerySum(start, end) {
    const query = `
    SELECT SUM(a.cost) from (SELECT *, st_transform(geom, ${config_pg.output_srid}) as geom, st_asgeojson(st_transform(geom, ${config_pg.output_srid})) geojson, st_astext(st_transform(geom, ${config_pg.output_srid})) wkt FROM pgr_dijkstra(
        'SELECT id, source, target, cost_len as cost, rcost_len as reverse_cost FROM ${config_pg.table}', 
        (SELECT id FROM ${config_pg.vertices_table} ORDER BY st_distance(the_geom, st_setsrid(st_makepoint(${start}), ${config_pg.input_srid})) LIMIT 1),
        (SELECT id FROM ${config_pg.vertices_table} ORDER BY st_distance(the_geom, st_setsrid(st_makepoint(${end}), ${config_pg.input_srid})) LIMIT 1),
        false) as dj, ${config_pg.table} as ln where dj.edge=ln."id") a
        `;
    return query;
}

function nearbyQuery(lat, lng, buffer, limit) {
    const point = `ST_SetSRID(ST_MakePoint(${lat}, ${lng}), ${config_pg.input_srid})`;
    const query = `
    SELECT *, st_transform(geom, ${config_pg.output_srid}) as geom, st_asgeojson(st_transform(geom, ${config_pg.output_srid})) geojson, st_astext(st_transform(geom, ${config_pg.output_srid})) wkt, ST_Distance(geom, ${point}) distance
    FROM ${config_pg.table}
    WHERE ST_DWithin(geom, ${point}, ${buffer})
    ORDER BY ST_Distance(geom, ${point}) asc
    LIMIT ${limit}`;
    return query;
}

function route(start, end) {
    return new Promise((resolve, reject) => {
        query(routeQuery(start, end), (err, res) => {
            if (err) {
                reject('query error', err);
                return;
            }
            resolve({
                route: res.rows,
                // route: res.rows.map(r => ({
                // geom: r.geom,
                // cost: r.cost
                // }))
            });
        });
    });
}

function routesum(start, end) {
    return new Promise((resolve, reject) => {
        query(routeQuerySum(start, end), (err, res) => {
            if (err) {
                reject('query error', err);
                return;
            }
            resolve({
                distance: res.rows
            });
        });
    });
}

function distance(start, end) {
    return new Promise((resolve, reject) => {
        query(distanceQuery(start, end), (err, res) => {
            if (err) {
                reject('query error', err);
                return;
            }
            // let cost = res.rows.map(r => r.cost).reduce((a, b) => a + b);
            resolve({
                // distance: cost
                distance_meters: res.rows[res.rows.length - 1].agg_cost,
            });
        });
    });
}

function closest(lat, lng, buffer, limit) {
    return new Promise((resolve, reject) => {
        query(nearbyQuery(lat, lng, buffer, limit), (err, res) => {
            if (err) {
                reject(err);
                return;
            }

            resolve(res.rows);
        });
    });
}

createTopology = async () => {

    new Promise((resolve, reject) => {
        query("SELECT pgr_createTopology('line', 0.0001, 'geom', 'id')", () => {
            console.log("1");
            resolve(
                query("SELECT  pgr_analyzeGraph('line',0.0001,'geom','id','source','target')", () => {
                    console.log("2");
                    query("UPDATE line SET cost_len = ST_Length(st_transform(geom, 3857))", () => {
                        console.log("3");
                        query("UPDATE line SET rcost_len = cost_len)", () => {
                            console.log("4");
                        })
                    })
                })
            )
        })
    })

}

module.exports = {
    route,
    distance,
    closest,
    routesum,
    createTopology
};
