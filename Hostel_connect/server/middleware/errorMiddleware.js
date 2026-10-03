export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Handle MySQL Duplicate Entry (Error 1062 / ER_DUP_ENTRY)
  if (err.code === 'ER_DUP_ENTRY' || err.errno === 1062) {
    statusCode = 400;
    message = 'Duplicate entry detected. A record with this unique value already exists.';
  }

  // Handle MySQL Foreign Key Constraint Failures (Error 1452)
  if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.errno === 1452) {
    statusCode = 400;
    message = 'Referenced record (Hostel, Room, or Student) does not exist.';
  }

  // Handle MySQL Foreign Key Delete Restriction (Error 1451)
  if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.errno === 1451) {
    statusCode = 400;
    message = 'Cannot delete this record because other records depend on it.';
  }

  // Handle MySQL Connection Refused
  if (err.code === 'ECONNREFUSED') {
    statusCode = 503;
    message = 'Database service unavailable. Please check that MySQL server is running.';
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};
