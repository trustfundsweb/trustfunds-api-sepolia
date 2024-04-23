const welcome = async (req, res) => {
  res.status(200).json({ message: "API alive!" });
};

module.exports = welcome;
