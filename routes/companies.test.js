
import { beforeEach, afterAll, describe, test, expect } from "vitest";
import request from "supertest";
import app from "../app.js";
import db from "../db.js";

// {id}, {id}, ...
let testCompany1, testCompany2, testInvoice1, testInvoice2;

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

//TODO: Can we use Date object for testing the current date.
expect.any(String)

describe("GET /companies", function (){

  test("Get a list of companies", async function(){
    const resp = await request(app).get("/companies");

    expect(resp.body).toEqual(
      {
        companies: [
          { code: 'cCode1', name: 'cName1' },
          { code: 'cCode2', name: 'cName2' }
        ]
      }
    )
  })
});


describe("GET /companies:code ", function (){

  test("Get a company by code", async function(){
    const resp = await request(app).get(`/companies/${testCompany1.code}`);

    expect(resp.body).toEqual(
      {
        company: {
          code: 'cCode1',
          name: 'cName1',
          description: 'cDescription1',
          invoices: [ testInvoice1.id ]
        }
      }
    )
  })

  test("Get a 404 when getting a company by an invalid code", async function(){
    const resp = await request(app)
      .get(`/companies/${testCompany1.code + testCompany2.code}`);

    expect(resp.statusCode).toEqual(404)
  })
});


afterAll(async function () {
  await db.end();
});