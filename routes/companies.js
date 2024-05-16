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


export default router;