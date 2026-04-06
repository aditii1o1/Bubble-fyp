function errorHandler(err, req, res, next) {
  let status = Number(err?.status || 500);
  let message = String(err?.message || "Server error");

  if (err?.name === "MulterError") {
    status = 400;
    if (err.code === "LIMIT_FILE_SIZE") {
      message = "Image is too large. Max size is 5MB.";
    }
  }

  const shouldLog =
    status >= 500 ||
    String(req?.originalUrl || "").includes("/api/donate") ||
    String(req?.originalUrl || "").includes("/payment/callback");

  if (shouldLog) {
    console.error("[ERROR]", {
      method: req?.method || "",
      url: req?.originalUrl || "",
      status,
      message,
      payload: err?.payload || null,
      stack: err?.stack || null,
    });
  }

  res.status(status).json({ message });
}

export { errorHandler };
