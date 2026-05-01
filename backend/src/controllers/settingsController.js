const Settings = require('../models/Settings');

// GET /api/settings/:key
exports.getSetting = async (req, res, next) => {
  try {
    const setting = await Settings.findOne({ key: req.params.key });
    res.json({ success: true, data: setting ? setting.value : null });
  } catch (error) {
    next(error);
  }
};

// PUT /api/settings/:key — Admin only
exports.updateSetting = async (req, res, next) => {
  try {
    const { value } = req.body;
    const setting = await Settings.findOneAndUpdate(
      { key: req.params.key },
      { value, updatedBy: req.user._id },
      { upsert: true, new: true }
    );
    res.json({ success: true, message: `Setting ${req.params.key} updated.`, data: setting.value });
  } catch (error) {
    next(error);
  }
};
