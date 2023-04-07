import { assertEquals } from "std/testing/asserts.ts";
import { QueryBuilder } from "~/lib/query_builder.ts";

const LIMIT = 10;

function build(depId: number, baseSalary?: number) {
  const builder = new QueryBuilder()
    .append`SELECT * FROM emp WHERE dep_id = ${depId}`; // (A)
  if (baseSalary) {
    builder.append`AND salary > ${baseSalary}`; // (B)
  }
  builder.append(`ORDER BY DESC limit ${LIMIT}`); // (C)
  return builder;
}

Deno.test("with baseSalary", () => {
  const builder = build(1, 100);
  assertEquals(
    builder.query,
    "SELECT * FROM emp WHERE dep_id = $1 AND salary > $2 ORDER BY DESC limit 10",
  );
  assertEquals(builder.args, [1, 100]);
});

Deno.test("without baseSalary", () => {
  const builder = build(1);
  assertEquals(
    builder.query,
    "SELECT * FROM emp WHERE dep_id = $1 ORDER BY DESC limit 10",
  );
  assertEquals(builder.args, [1]);
});
