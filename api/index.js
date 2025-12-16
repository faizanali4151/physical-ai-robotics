module.exports = (req, res) => {
  res.status(200).json({
    message: "Welcome to the API",
    endpoints: {
      health: "/api/health"
    }
  });
};
