#!/usr/bin/env -S deno run --allow-net=localhost,leaves.deno.dev,leaves--develop.deno.dev

import { Input } from "https://deno.land/x/cliffy@v1.0.0-rc.3/prompt/input.ts";
import { Select } from "https://deno.land/x/cliffy@v1.0.0-rc.3/prompt/select.ts";
import {
  clearScreen,
  colors,
} from "https://deno.land/x/cliffy@v1.0.0-rc.3/ansi/mod.ts";

const COMMAND_OPTIONS = [{ value: -1, name: ":Back" }, {
  value: -2,
  name: ":Exit",
}];
const keys = { next: ["j", "down"], previous: ["k", "up"] };
const API_PATH = Deno.args.at(0) === "dev"
  ? "http://localhost:8000/api/cli"
  : "https://leaves.deno.dev/api/cli";

let list: Array<{ value: number; name: string }> = [];
let searchSkip = false;
let word = "";

while (true) {
  console.log(clearScreen);
  if (!searchSkip) {
    word = await Input.prompt({ message: "Search", suggestions: [word] });
    if (!word) {
      Deno.exit();
    }
    const url = new URL(`${API_PATH}/search`);
    url.searchParams.set("q", word);
    const res = await fetch(url);
    list = await res.json() as Array<{ name: string; value: number }>;
    if (list.length === 0) {
      console.log("Not Found");
      Deno.exit();
    }
    if (list.length >= 10) {
      console.log(
        colors.bold.yellow(
          "More than 10 posts hits were found. Let's add search words!",
        ),
      );
    }
  }

  const postId: any = await Select.prompt({ // 型推論がおかしい
    message: "Select",
    maxRows: 12,
    options: list.concat(COMMAND_OPTIONS),
    keys,
  });

  if (postId === -1) {
    searchSkip = false;
    continue;
  } else if (postId === -2) {
    Deno.exit(0);
  }

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
  const option: any = await Select.prompt({
    message: "Select",
    options: COMMAND_OPTIONS,
    keys,
  });
  if (option === -2) {
    Deno.exit(0);
  } else if (option === -1) {
    searchSkip = true;
  }
}
