/* Routes for companies */

import express from "express";
import db from "../db.js";
import { BadRequestError, NotFoundError } from "../expressError.js";

const router = express.Router();

/** Get companies
 *
 * Returns {companies: [{code, name}, ...]}
*/
router.get("", async function (req, res) {
  const results = await db.query(
    `SELECT code, name
    FROM companies`);

  const companies = results.rows;

  return res.json({ companies });
});

/** Get company by code
 *
 * Returns {company: {code, name, description}}
*/
router.get("/:code", async function (req, res) {
  const code = req.params.code;

  const results = await db.query(
    `SELECT code, name, description
    FROM companies
    WHERE code = $1`,
    [code]);

  const company = results.rows[0];

  //TODO: does it matter if we do a falsy check?
  if (company === undefined) {
    throw new NotFoundError();
  }

  return res.json({ companies });
});

/** Add a company
 * Inputs:
 * - JSON of {code, name, description}
 * Returns {company: {code, name, description}}
 */
router.post("", async function (req, res) {
  const newCompany = req.body;

  if (newCompany === undefined) {
    throw new BadRequestError();
  }

  if (!("code" in newCompany)) {
    throw new BadRequestError();
  }

  if (!("name" in newCompany)) {
    throw new BadRequestError();
  }

  if (!("description" in newCompany)) {
    throw new BadRequestError();
  }

  const results = await db.query(
    `
    INSERT INTO companies (code, name, description)
    VALUES ($1, $2, $3)
    RETURNING code, name, description
    `, [newCompany.code, newCompany.name, newCompany.description]
  );
  const company = results.rows[0];

  return res.status(201).json({ company });

})


export default router;