exports.uploadFile = async (req, res) => {
  try {
    return res.status(200).json({
      message: "Upload fonctionnel (placeholder)"
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message
    });
  }
};

exports.getUploads = async (req, res) => {
  try {
    return res.status(200).json({
      message: "Liste uploads (placeholder)",
      data: []
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message
    });
  }
};

exports.deleteUpload = async (req, res) => {
  try {
    return res.status(200).json({
      message: "Upload supprimé (placeholder)"
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message
    });
  }
};