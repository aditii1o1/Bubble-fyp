function errorHandler(err, req, res, next) {
  const status = Number(err?.status || 500);
  const message = String(err?.message || "Server error");
  res.status(status).json({ message });
}

export { errorHandler };
