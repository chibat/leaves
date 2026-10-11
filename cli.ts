#!/usr/bin/env node

import { emitKeypressEvents } from "node:readline";
import { createInterface } from "node:readline/promises";

type Option = { value: number; name: string };

function isOption(value: unknown): value is Option {
  return typeof value === "object" && value !== null &&
    "name" in value && typeof value.name === "string" &&
    "value" in value && typeof value.value === "number";
}

const COMMAND_OPTIONS: Option[] = [
  { value: -1, name: ":Back" },
  { value: -2, name: ":Exit" },
];
const API_PATH = process.argv.at(2) === "dev"
  ? "http://localhost:8000/api/cli"
  : "https://leaves.chiba.dev/api/cli";

function question(prompt: string) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return rl.question(prompt).finally(() => rl.close());
}

function clearScreen() {
  process.stdout.write("\x1b[2J\x1b[H");
}

function selectOption(
  message: string,
  options: Option[],
  clearBeforeRender = true,
): Promise<number | null> {
  if (!process.stdin.isTTY || !process.stdin.setRawMode) {
    console.log(message);
    options.forEach((option, index) => {
      console.log(`${index + 1}. ${option.name}`);
    });
    return question("Select a number: ").then((answer) => {
      const index = Number(answer) - 1;
      return Number.isInteger(index) && options[index]
        ? options[index].value
        : selectOption(message, options);
    });
  }

  emitKeypressEvents(process.stdin);
  process.stdin.setRawMode(true);
  process.stdin.resume();
  let selected = 0;
  let rendered = false;
  const render = () => {
    if (clearBeforeRender) {
      clearScreen();
    } else if (rendered) {
      process.stdout.write(`\x1b[${options.length + 1}A\x1b[J`);
    }
    console.log(`${message} (↑/↓ or j/k, Enter to select, Ctrl+C to exit)`);
    options.forEach((option, index) => {
      const marker = index === selected ? "›" : " ";
      console.log(`${marker} ${option.name}`);
    });
    rendered = true;
  };

  return new Promise((resolve) => {
    const finish = (value: number | null) => {
      process.stdin.off("keypress", onKeypress);
      process.stdin.setRawMode(false);
      process.stdin.pause();
      process.stdout.write("\n");
      resolve(value);
    };
    const onKeypress = (_input: string, key: { name?: string; ctrl?: boolean }) => {
      if (key.ctrl && key.name === "c") {
        finish(null);
      } else if (key.name === "up" || key.name === "k") {
        selected = (selected + options.length - 1) % options.length;
        render();
      } else if (key.name === "down" || key.name === "j") {
        selected = (selected + 1) % options.length;
        render();
      } else if (key.name === "return") {
        finish(options[selected].value);
      }
    };
    process.stdin.on("keypress", onKeypress);
    render();
  });
}

async function main() {
  let list: Option[] = [];
  let searchSkip = false;
  let word = "";

  while (true) {
    clearScreen();
    if (!searchSkip) {
      word = (await question(`Search${word ? ` [${word}]` : ""}: `)).trim();
      if (!word) return;

      const url = new URL(`${API_PATH}/search`);
      url.searchParams.set("q", word);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Search failed: ${response.status} ${response.statusText}`);
      }
      const results: unknown = await response.json();
      if (!Array.isArray(results) || !results.every(isOption)) {
        throw new Error("Search returned an invalid response");
      }
      list = results;
      if (list.length === 0) {
        console.log("Not Found");
        return;
      }
      if (list.length >= 10) {
        console.log(
          "\x1b[1;33mMore than 10 posts hits were found. Let's add search words!\x1b[0m",
        );
      }
    }

    const postId = await selectOption(
      "Select a post",
      list.concat(COMMAND_OPTIONS),
    );
    if (postId === null || postId === -2) return;
    if (postId === -1) {
      searchSkip = false;
      continue;
    }

    const response = await fetch(`${API_PATH}/posts/${postId}`);
    if (!response.ok) {
      throw new Error(`Fetching post failed: ${response.status} ${response.statusText}`);
    }
    const post: unknown = await response.json();
    if (typeof post !== "object" || post === null || !("source" in post)) {
      throw new Error("Post response did not contain source");
    }
    console.log("-".repeat(81));
    console.log(post.source);
    console.log("-".repeat(81));
    console.log(`https://leaves.chiba.dev/posts/${postId}`);

    const command = await selectOption("Select", COMMAND_OPTIONS, false);
    if (command === null || command === -2) return;
    searchSkip = command === -1;
  }
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
