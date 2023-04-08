import { assertEquals } from "std/testing/asserts.ts";
import { QueryBuilder } from "~/lib/query_builder.ts";

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

Deno.test("with age", () => {
  const builder = build({ deptId: 1, age: 50 });
  assertEquals(
    builder.query,
    "SELECT * FROM emp WHERE dept_id = $1 AND age > $2 ORDER BY DESC salary LIMIT 10",
  );
  assertEquals(builder.args, [1, 50]);
});

Deno.test("without age", () => {
  const builder = build({ deptId: 1 });
  assertEquals(
    builder.query,
    "SELECT * FROM emp WHERE dept_id = $1 ORDER BY DESC salary LIMIT 10",
  );
  assertEquals(builder.args, [1]);
});
