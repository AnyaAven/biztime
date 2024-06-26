/** BizTime express application. */

import express from "express";
import morgan from "morgan";

import { NotFoundError } from "./expressError.js";
import companyRoutes from "./routes/companies.js";
import invoicesRoutes from "./routes/invoices.js";

const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use("/companies", companyRoutes);
app.use("/invoices", invoicesRoutes);


/** 404 handler: matches unmatched routes; raises NotFoundError. */
app.use(function (req, res, next) {
  throw new NotFoundError();
});

/** Error handler: logs stacktrace and returns JSON error message. */
app.use(function (err, req, res, next) {
  const status = err.status || 500;
  const message = err.message;
  if (process.env.NODE_ENV !== "test") console.error(status, err.stack);
  return res.status(status).json({ error: { message, status } });
});



export default app;
