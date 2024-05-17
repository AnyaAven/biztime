
import { beforeEach, afterAll, describe, test, expect } from "vitest";
import request from "supertest";
import app from "../app.js";
import db from "../db.js";

// {id}, {id}, ...
let testCompany1, testCompany2, testInvoice1, testInvoice2;

//TODO: Can we use Date object for testing the current date.
//expect.any(String);


beforeEach(async function (){
  await db.query("DELETE FROM companies");
  await db.query("DELETE FROM invoices");

  const cResults = await db.query(`
    INSERT INTO companies (code, name, description)
    VALUES ('cCode1', 'cName1', 'cDescription1'),
          ('cCode2', 'cName2', 'cDescription2')
    RETURNING code`);

  testCompany1 = cResults.rows[0];
  testCompany2 = cResults.rows[1];

  const iResults = await db.query(`
    INSERT INTO invoices (comp_code, amt)
    VALUES ('cCode1', 100),
          ('cCode2', 200)
    RETURNING id`);

  testInvoice1 = iResults.rows[0];
  testInvoice2 = iResults.rows[1];
});

describe("GET /invoices", function (){

  test("Get a list of invoices", async function(){
    const resp = await request(app).get("/invoices");

    expect(resp.body).toEqual(
      {
        invoices: [
          { id: expect.any(Number), comp_code: 'cCode1' },
          { id: expect.any(Number), comp_code: 'cCode2' } ]
      }
    )
  })
});

afterAll(async function () {
  await db.end();
});