/* Routes for companies */

import express from "express";
import db from "../db.js";
import { BadRequestError, NotFoundError } from "../expressError.js";

const router = express.Router();

/** Get invoices
 *
 * Returns {invoices: [{id, comp_code}, ...]}
*/
router.get("", async function (req, res) {
    const results = await db.query(
        `SELECT id, comp_code
            FROM invoices
            ORDER BY id`);
    const invoices = results.rows;

    return res.json({ invoices });
});

/** Get an invoice by id
 *
 * Returns: 
 * {
 *  invoice: {
 *      id,
 *      amt,
 *      paid, 
 *      add_date,
 *      paid_date,
 *      company: {code, name, description}
 *  }
 * }
*/
router.get("/:id", async function (req, res) {
    const id = req.params.id;

    //TODO: use a join (only getting back 1 row from the query)
    const iResults = await db.query(
        `SELECT id, amt, paid, add_date, paid_date, comp_code
            FROM invoices
            WHERE id = $1`,
        [id]);

    const invoice = iResults.rows[0];

    if (!invoice) throw new NotFoundError();

    const compCode = invoice.comp_code;
    delete invoice.comp_code;

    const cResults = await db.query(
        `SELECT code, name, description
            FROM companies
            WHERE code = $1`,
        [compCode]
    );

    const company = cResults.rows[0];

    invoice.company = company;

    return res.json({ invoice });
});

/** Add an invoice
 * Inputs:
 * - JSON of {comp_code, amt}
 * Returns:
 * {
 *  invoice: {
 *      id,
 *      comp_code,
 *      amt,
 *      paid, 
 *      add_date,
 *      paid_date,
 *  }
 * }
 */
router.post("", async function (req, res) {
    if (req.body === undefined) {
        throw new BadRequestError();
    }

    //TODO: handle errors for creating invoices for companies that don't exist
    // could query the db and see if the company exists
    // generally do not want to be sending 500s (send 404s or BadRequestError)
    // could wrap insert statement in a try/catch IntegrityError
    let { comp_code, amt } = req.body;
    amt = Number(amt);

    if (isNaN(amt)) {
        throw new BadRequestError();
    }

    const results = await db.query(
        `INSERT INTO invoices (comp_code, amt)
            VALUES ($1, $2)
            RETURNING id, comp_code, amt, paid, add_date, paid_date`,
        [comp_code, amt]
    );
    const invoice = results.rows[0];

    return res.status(201).json({ invoice });

});


/** Update an invoice
 *
 * Inputs:
 * - JSON of {amt}
  * Returns:
 * {
 *  invoice: {
 *      id,
 *      comp_code,
 *      amt,
 *      paid, 
 *      add_date,
 *      paid_date,
 *  }
 * }
 */
router.put("/:id", async function (req, res) {
    const id = req.params.id;

    if (req.body === undefined) {
        throw new BadRequestError();
    }

    let { amt } = req.body;
    amt = Number(amt);

    if (isNaN(amt)) {
        throw new BadRequestError();
    }

    const results = await db.query(
        `UPDATE invoices
            SET amt=$1
            WHERE id = $2
            RETURNING id, comp_code, amt, paid, add_date, paid_date`,
        [amt, id]
    );
    const invoice = results.rows[0];

    if (!invoice) {
        throw new NotFoundError();
    }

    return res.json({ invoice });
});

/** Delete invoice by id 
 * TODO: include example of what you're passing back
*/
router.delete("/:id", async function (req, res) {
    const id = req.params.id;

    const results = await db.query(
        `DELETE FROM invoices
            WHERE id = $1
            RETURNING id`,
        [id]
    );

    if (!results.rows[0]) throw new NotFoundError();

    return res.json({ status: "deleted" });
});


export default router;