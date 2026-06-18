import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const pageSource = readFileSync(new URL("../app/page.jsx", import.meta.url), "utf8");
const cssSource = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");

test("wheel center exposes the same spin action as a button", () => {
  assert.match(pageSource, /<DrinkWheel[\s\S]*onSpin=\{spin\}/);
  assert.match(pageSource, /className="wheel-center-button"/);
  assert.match(pageSource, /onClick=\{onSpin\}/);
  assert.match(pageSource, /disabled=\{isSpinning \|\| candidates\.length === 0\}/);
  assert.match(cssSource, /\.wheel-center-button/);
});

test("result display sits under the wheel without the candidate pool card", () => {
  assert.doesNotMatch(pageSource, /candidate-list/);
  assert.doesNotMatch(pageSource, /当前候选池/);
  assert.doesNotMatch(pageSource, /<aside className="result-panel"/);
  assert.match(pageSource, /<div className="wheel-panel">[\s\S]*<div className=\{`result-card/);
  assert.match(cssSource, /grid-template-columns: minmax\(240px, 320px\) minmax\(420px, 1fr\)/);
  assert.doesNotMatch(cssSource, /\.candidate-list/);
});
