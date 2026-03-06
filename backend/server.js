const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());

// Phục vụ các file tĩnh (index.html) từ thư mục dự án
app.use(express.static(__dirname + '/../'));

// Cấu hình kết nối Database
const pool = new Pool({
  connectionString: "postgresql://kcn_user:W6FKO1t6z7osz4KixYPorj9c0bJ6WHfU@dpg-d6l56eh4tr6s73chrvo0-a.oregon-postgres.render.com/kcn",
  ssl: { rejectUnauthorized: false }
});

app.get('/all', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT json_build_object(
        'type', 'FeatureCollection',
        'features', json_agg(
          json_build_object(
            'type', 'Feature',
            'geometry', ST_AsGeoJSON(ST_Transform(geom, 4326))::json,
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
    `);
    res.json(result.rows[0].json_build_object);
  } catch (err) {
    console.error("Lỗi truy vấn:", err.message);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server đang chạy tại cổng ${PORT}`);
});