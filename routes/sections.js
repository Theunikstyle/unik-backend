const express = require('express');
const { TrendingSection, ComboSection, ConcernSection } = require('../models/Sections');
const { auth, adminOnly } = require('../middleware/auth');
const router = express.Router();

// Helper to get model by section name
const getSectionModel = (section) => {
  switch (section) {
    case 'trending': return TrendingSection;
    case 'combos': return ComboSection;
    case 'concern': return ConcernSection;
    default: throw new Error('Invalid section');
  }
};

// GET section
router.get('/:section', async (req, res) => {
  try {
    const Model = getSectionModel(req.params.section);
    const section = await Model.findOne().populate('products.product');
    res.json(section);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT section (admin only, update or create)
router.put('/:section', auth, adminOnly, async (req, res) => {
  try {
    const Model = getSectionModel(req.params.section);
    let section = await Model.findOne();
    if (!section) {
      section = new Model(req.body);
    } else {
      Object.assign(section, req.body);
    }
    await section.save();
    res.json(section);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
