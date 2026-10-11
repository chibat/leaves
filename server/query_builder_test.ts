import assert from "node:assert/strict";
import test from "node:test";
import { QueryBuilder } from "./query_builder.ts";

const LIMIT = 10;

function build({ deptId, age }: { deptId: number; age?: number }) {
  const builder = new QueryBuilder()
    .append`SELECT * FROM emp WHERE dept_id = ${deptId}`; // (A)
  if (age) {
    builder.append`AND age > ${age}`; // (B)
  }
  builder.append(`ORDER BY DESC salary LIMIT ${LIMIT}`); // (C)
  return builder;
}

test("with age", () => {
  const builder = build({ deptId: 1, age: 50 });
  assert.equal(
    builder.query,
    "SELECT * FROM emp WHERE dept_id = $1 AND age > $2 ORDER BY DESC salary LIMIT 10",
  );
  assert.deepEqual(builder.args, [1, 50]);
});

test("without age", () => {
  const builder = build({ deptId: 1 });
  assert.equal(
    builder.query,
    "SELECT * FROM emp WHERE dept_id = $1 ORDER BY DESC salary LIMIT 10",
  );
  assert.deepEqual(builder.args, [1]);
});
