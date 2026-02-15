// Backend API Routes for Operator Master
// Add these routes to your Express backend

const express = require('express');
const router = express.Router();

// GET /api/operators - Get all operators
router.get('/operators', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM operators ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/operators/section/:sectionName - Get operators by section
router.get('/operators/section/:sectionName', async (req, res) => {
  try {
    const { sectionName } = req.params;
    const [rows] = await db.query(
      'SELECT * FROM operators WHERE JSON_CONTAINS(sections, ?) AND is_active = TRUE',
      [JSON.stringify(sectionName)]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/operators - Create operator
router.post('/operators', async (req, res) => {
  try {
    const { firstName, middleName, lastName, shortName, role, sections, age, gender, isActive } = req.body;
    const [result] = await db.query(
      'INSERT INTO operators (first_name, middle_name, last_name, short_name, role, sections, age, gender, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [firstName, middleName, lastName, shortName, role, JSON.stringify(sections), age, gender, isActive]
    );
    res.json({ id: result.insertId, message: 'Operator created' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/operators/:id - Update operator
router.put('/operators/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, middleName, lastName, shortName, role, sections, age, gender, isActive } = req.body;
    await db.query(
      'UPDATE operators SET first_name=?, middle_name=?, last_name=?, short_name=?, role=?, sections=?, age=?, gender=?, is_active=? WHERE id=?',
      [firstName, middleName, lastName, shortName, role, JSON.stringify(sections), age, gender, isActive, id]
    );
    res.json({ message: 'Operator updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/operators/:id - Delete operator
router.delete('/operators/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM operators WHERE id = ?', [id]);
    res.json({ message: 'Operator deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
