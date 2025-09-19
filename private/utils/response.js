export const sendResponse = (res, data, status = 200) => {
  return res.status(status).json(data);
};

export const sendError = (res, err) => {
  console.error(err);
  return res.status(err.info.status).json({
    ...err,
    message: "Internal Server Error",
  });
};
