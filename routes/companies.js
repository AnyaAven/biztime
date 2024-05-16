/* Routes for companies */

import express from "express";
import db from "../db.js";
import { BadRequestError } from "../expressError.js";

const router = express.Router();

/** Get companies
 *
 * Returns {companies: [{code, name}, ...]}
*/
router.get("", async function(req, res){
  const results = await db.query(
    `SELECT code, name
    FROM companies`);

  const companies = results.rows;

  return res.json({ companies });
});

// TODO: add error code
/** Get company by code
 *
 * Returns {company: {code, name, description}}
*/
router.get("/:code", async function(req, res){
  const code = req.params.code;

  const results = await db.query(
    `SELECT code, name, description
    FROM companies
    WHERE code = $1`,
    [code]);

  const company = results.rows[0];

  return res.json({ companies });
});


export default router;