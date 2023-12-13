#!/usr/bin/env -S deno run --allow-net=localhost,leaves.deno.dev,leaves--develop.deno.dev

import { Input } from "https://deno.land/x/cliffy@v1.0.0-rc.3/prompt/input.ts";
import { Select } from "https://deno.land/x/cliffy@v1.0.0-rc.3/prompt/select.ts";
import {
  clearScreen,
} from "https://deno.land/x/cliffy@v1.0.0-rc.3/ansi/mod.ts";

console.log(clearScreen);
const word = await Input.prompt("Search");
if (!word) {
  Deno.exit();
}

const API_PATH = Deno.args.at(0) === "dev"
  ? "http://localhost:8000/api/cli"
  : "https://leaves.deno.dev/api/cli";

const url = new URL(`${API_PATH}/search`);
url.searchParams.set("q", word);

const res = await fetch(url);
const options: any[] = await res.json();
if (options.length === 0) {
  console.log("Not Found");
  Deno.exit();
}

const postId = await Select.prompt({
  message: "Select",
  options,
  keys: { next: ["j", "down"], previous: ["k", "up"] },
});

{
  const res = await fetch(`${API_PATH}/posts/${postId}`);
  const json = await res.json();
  console.log(
    "---------------------------------------------------------------------------------",
  );
  console.log(json.source);
  console.log(
    "---------------------------------------------------------------------------------",
  );
  console.log(`https://leaves.deno.dev/posts/${postId}`);
}
