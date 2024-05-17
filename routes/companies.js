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
        FROM companies
        ORDER BY code`
  );
  const companies = results.rows;

  return res.json({ companies });
});

/** Get company by code
 *
 * Returns {company: {code, name, description, invoices: [id, ...]}}
*/
router.get("/:code", async function (req, res) {
  const code = req.params.code;

  const cResults = await db.query(
    `SELECT code, name, description
        FROM companies
        WHERE code = $1`,
    [code]
  );
  const company = cResults.rows[0];

  if (company === undefined) {
    throw new NotFoundError();
  }

  const iResults = await db.query(
    `SELECT id
        FROM invoices
        WHERE comp_code = $1
        ORDER BY id`,
    [code]
  );


  let invoiceIds;
  if (!iResults.rows) {
    invoiceIds = [];
  } else {
    invoiceIds = iResults.rows.map(inv => inv.id);
  }

  company.invoices = invoiceIds;

  return res.json({ company });
});

/** Add a company
 * Inputs:
 * - JSON of {code, name, description}
 * Returns {company: {code, name, description}}
 */
router.post("", async function (req, res) {
  if (req.body === undefined) {
    throw new BadRequestError();
  }

  if (!("code" in req.body) ||
    !("name" in req.body) ||
    !("description" in req.body)) {
    throw new BadRequestError();
  }
  const { code, name, description } = req.body;

  const results = await db.query(
    `
    INSERT INTO companies (code, name, description)
    VALUES ($1, $2, $3)
    RETURNING code, name, description
    `, [code, name, description]
  );
  const company = results.rows[0];

  return res.status(201).json({ company });

});


/** Update a company
 *
 * Inputs:
 * - JSON of {name, description}
 * Returns {company: {code, name, description}}
 */
router.put("/:code", async function (req, res) {
  const code = req.params.code;

  const updateCompany = req.body;

  if (updateCompany === undefined) {
    throw new BadRequestError();
  }

  if (!("name" in updateCompany) || !("description" in updateCompany)) {
    throw new BadRequestError();
  }

  const results = await db.query(
    `
    UPDATE companies
    SET name=$1,
        description=$2
    WHERE code = $3
    RETURNING code, name, description
    `, [updateCompany.name, updateCompany.description, code]
  );
  const company = results.rows[0];

  if (!company) {
    throw new NotFoundError();
  }

  return res.json({ company });
});

/** Delete company by code */
router.delete("/:code", async function (req, res) {
  const code = req.params.code;

  const results = await db.query(
    `DELETE FROM companies
    WHERE code = $1
    RETURNING code`, [code]
  );

  if (!results.rows[0]) throw new NotFoundError();

  return res.json({ status: "deleted" });
});


export default router;