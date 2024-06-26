
import { beforeEach, afterAll, describe, test, expect } from "vitest";
import request from "supertest";
import app from "../app.js";
import db from "../db.js";

// {id}, {id}, ...
let testCompany1, testCompany2, testInvoice1;

beforeEach(async function () {
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
    VALUES ('cCode1', 100)
    RETURNING id`);

  testInvoice1 = iResults.rows[0];
});


describe("GET /companies", function () {

  test("Get a list of companies", async function () {
    const resp = await request(app).get("/companies");

    expect(resp.body).toEqual(
      {
        companies: [
          { code: 'cCode1', name: 'cName1' },
          { code: 'cCode2', name: 'cName2' }
        ]
      }
    );

    expect(resp.statusCode).toEqual(200);
  });
});


describe("GET /companies/:code ", function () {

  test("Get a company by code", async function () {
    const resp = await request(app).get(`/companies/${testCompany1.code}`);

    expect(resp.body).toEqual(
      {
        company: {
          code: 'cCode1',
          name: 'cName1',
          description: 'cDescription1',
          invoices: [testInvoice1.id]
        }
      }
    );

    expect(resp.statusCode).toEqual(200);
  });

  test("Get a company without any invoices", async function () {
    const resp = await request(app).get(`/companies/${testCompany2.code}`);

    expect(resp.body).toEqual(
      {
        company: {
          code: 'cCode2',
          name: 'cName2',
          description: 'cDescription2',
          invoices: []
        }
      }
    );

    expect(resp.statusCode).toEqual(200);
  });

  test("Get a 404 when getting a company by an invalid code", async function () {
    const resp = await request(app)
      .get(`/companies/${testCompany1.code + testCompany2.code}`);

    expect(resp.statusCode).toEqual(404);
  });
});


describe("POST /companies ", function () {

  test("Add a company to the DB ", async function () {
    let results = await db.query("SELECT code FROM companies");

    expect(results.rows.length).toEqual(2);

    const resp = await request(app)
      .post("/companies")
      .send({
        code: "newCompanyCode",
        name: "newCompanyName",
        description: "newDescription"
      });

    expect(resp.body).toEqual(
      {
        company: {
          code: 'newCompanyCode',
          name: 'newCompanyName',
          description: 'newDescription'
        }
      }
    );
    expect(resp.statusCode).toEqual(201);

    results = await db.query("SELECT code FROM companies");
    expect(results.rows.length).toEqual(3);
  });

  test("Get a 400 when adding a company without sending json", async function () {
    const resp = await request(app)
      .post(`/companies`);

    expect(resp.statusCode).toEqual(400);
  });

  test("Get a 400 when adding a company with the wrong body keys",
    async function () {
      const resp = await request(app)
        .post(`/companies`).send({
          badCode: "bad",
          badName: "bad",
          badDescription: "bad"
        });

      expect(resp.statusCode).toEqual(400);
    });
});


describe("PUT /companies/:code ", function () {

  test("Update an existing company ", async function () {

    const resp = await request(app)
      .put(`/companies/${testCompany1.code}`)
      .send({
        name: "changedCompanyName",
        description: "changedDescription"
      });

    expect(resp.body).toEqual(
      {
        company: {
          code: testCompany1.code,
          name: 'changedCompanyName',
          description: 'changedDescription'
        }
      }
    );
    expect(resp.statusCode).toEqual(200);
  });

  test("Get a 400 when updating a company without sending json",
    async function () {
      const resp = await request(app)
        .put(`/companies/${testCompany1.code}`);

      expect(resp.statusCode).toEqual(400);
    });

  test("Get a 400 when updating a company with the wrong body keys",
    async function () {
      const resp = await request(app)
        .put(`/companies/${testCompany1.code}`)
        .send({
          badName: "bad",
          badDescription: "bad"
        });

      expect(resp.statusCode).toEqual(400);
    });

  test("404 if company not found", async function () {

    const resp = await request(app)
      .put(`/companies/${testCompany1.code + testCompany2.code}`)
      .send({
        name: "changedCompanyName",
        description: "changedDescription"
      });

    expect(resp.statusCode).toEqual(404);
  });
});

describe("DELETE /companies/:code", function () {
  test("Delete a user", async function () {
    let results = await db.query("SELECT code FROM companies");
    expect(results.rows.length).toEqual(2);

    const resp = await request(app).delete(`/companies/${testCompany1.code}`);

    expect(resp.body).toEqual({ status: "deleted" });

    results = await db.query("SELECT code FROM companies");
    expect(results.rows.length).toEqual(1);
  });

  test("404 if company not found", async function () {

    const resp = await request(app)
      .delete(`/companies/${testCompany1.code + testCompany2.code}`);

    expect(resp.statusCode).toEqual(404);
  });

});

afterAll(async function () {
  await db.end();
});