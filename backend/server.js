const express = require('express')
const { Pool } = require('pg')
const cors = require('cors')

const app = express()
app.use(cors())

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'kcn',
  password: '123',
  port: 5432
})

app.get('/all', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT json_build_object(
        'type', 'FeatureCollection',
        'features', json_agg(
          json_build_object(
            'type', 'Feature',
            'geometry',
              ST_AsGeoJSON(
                ST_Transform(geom,4326)
              )::json,
            'properties', json_build_object(
              'layer', type
            )
          )
        )
      )
      FROM (
        SELECT 'building' AS type, geom FROM building
        UNION ALL
        SELECT 'road' AS type, geom FROM road
        UNION ALL
        SELECT 'garbadge' AS type, geom FROM garbadge
        UNION ALL
        SELECT 'bounds' AS type, geom FROM bounds
        UNION ALL
        SELECT 'instruction-generated' AS type, geom FROM "instruction-generated"
      ) AS all_data
    `)

    res.json(result.rows[0].json_build_object)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.listen(3000)