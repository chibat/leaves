export class QueryBuilder {
  #index = 1;
  #query = "";
  readonly #args: unknown[] = [];

  get query() {
    return this.#query;
  }

  get args() {
    return this.#args;
  }

  append(query: TemplateStringsArray | string, ...args: unknown[]) {
    if (this.#query !== "") {
      this.#query += " ";
    }
    if (typeof query === "string") {
      // query: string
      this.#query += query;
      return this;
    }
    // query: TemplateStringsArray
    query.forEach((value, index) => {
      this.#query += value +
        ((index < query.length - 1) ? "$" + (this.#index++) : "");
    });
    this.#args.push(...args);
    return this;
  }
}
