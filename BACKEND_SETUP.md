# Backend Implementation Guide for Operator Master

## Step 1: Update Database

Run this SQL in your MySQL database:

```sql
-- Run: database/migrate-operators.sql
```

This will:
- Backup existing operators
- Create new table with sections field
- Migrate old data
- Add sample operators

## Step 2: Update Backend Routes

Add these routes to your Express backend (e.g., `routes/operators.js`):

```javascript
const express = require('express');
const router = express.Router();

// GET /api/operators - Get all operators
router.get('/operators', async (req, res) => {
  try {
    const [rows] = await req.db.query('SELECT * FROM operators ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/operators/section/:sectionName - Get operators by section
router.get('/operators/section/:sectionName', async (req, res) => {
  try {
    const { sectionName } = req.params;
    const [rows] = await req.db.query(
      `SELECT * FROM operators 
       WHERE JSON_CONTAINS(sections, ?) 
       AND is_active = TRUE 
       ORDER BY short_name`,
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
    const [result] = await req.db.query(
      `INSERT INTO operators 
       (first_name, middle_name, last_name, short_name, role, sections, age, gender, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
    await req.db.query(
      `UPDATE operators 
       SET first_name=?, middle_name=?, last_name=?, short_name=?, role=?, sections=?, age=?, gender=?, is_active=? 
       WHERE id=?`,
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
    await req.db.query('DELETE FROM operators WHERE id = ?', [id]);
    res.json({ message: 'Operator deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
```

## Step 3: Register Routes in Main App

In your `server.js` or `app.js`:

```javascript
const operatorRoutes = require('./routes/operators');
app.use('/api', operatorRoutes);
```

## Step 4: Test Section-Based Filtering

After backend update, test these endpoints:

```bash
# Get all operators
curl https://resourceful-vision-production.up.railway.app/api/operators

# Get operators for Media Preparation section
curl https://resourceful-vision-production.up.railway.app/api/operators/section/Media%20Preparation

# Should return only: RKS, PDS (operators assigned to Media Preparation)
```

## Step 5: Update Frontend (After Backend is Ready)

Once backend is updated, revert the temporary fixes in frontend:

```bash
cd /Users/sahil/Desktop/erp-frontend-production
git revert HEAD  # Revert temporary fix
# Then apply the proper implementation
```

## How Section Filtering Works

1. **Operator Master**: Admin assigns sections to each operator
   - RKS → ["Media Preparation", "Subculturing"]
   - AB → ["Cleaning Record", "Quality Control"]

2. **In Forms**: When you open Media Preparation form
   - Frontend calls: `/api/operators/section/Media Preparation`
   - Backend returns: Only RKS and PDS (who have "Media Preparation" in their sections)
   - Dropdown shows: Only these filtered operators

3. **Result**: Each form only shows operators assigned to that specific section!

## Current Status

❌ Backend NOT updated yet - section filtering won't work
✅ Frontend ready - waiting for backend
✅ SQL migration ready - run `migrate-operators.sql`
✅ API routes ready - add to your backend

## Next Steps

1. Run `migrate-operators.sql` on your database
2. Add operator routes to your backend
3. Deploy backend
4. Test section filtering
5. Revert frontend temporary fixes
