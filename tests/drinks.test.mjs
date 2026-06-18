import test from "node:test";
import assert from "node:assert/strict";

import brandsData from "../data/brands.json" with { type: "json" };
import {
  CATEGORY_DEFINITIONS,
  buildDrinkCategories,
  getBrandsForCategory,
  sampleCandidateItems,
} from "../lib/drinks.js";

test("buildDrinkCategories maps brand data into the five PRD categories", () => {
  const categories = buildDrinkCategories(brandsData.brands);

  assert.equal(categories.length, CATEGORY_DEFINITIONS.length);
  assert.deepEqual(
    categories.map((category) => category.id),
    ["milk_tea", "coffee", "fruit_tea", "pure_tea", "yogurt_smoothie"],
  );
  assert.ok(
    categories.every((category) => category.items.length > 0),
    "every category should have drink candidates",
  );
});

test("buildDrinkCategories deduplicates duplicate SKUs from the same brand", () => {
  const categories = buildDrinkCategories([
    {
      id: "brand-a",
      nameZh: "测试品牌 A",
      categories: ["奶茶"],
      representativeItems: ["珍珠奶茶", "珍珠奶茶", "芋泥奶茶"],
    },
    {
      id: "brand-b",
      nameZh: "测试品牌 B",
      categories: ["奶茶"],
      representativeItems: ["珍珠奶茶", "烤奶"],
    },
  ]);

  assert.deepEqual(
    categories[0].items.map((item) => `${item.brandName}-${item.name}`),
    ["测试品牌 A-珍珠奶茶", "测试品牌 A-芋泥奶茶", "测试品牌 B-珍珠奶茶", "测试品牌 B-烤奶"],
  );
});

test("buildDrinkCategories keeps the source brand name for every SKU", () => {
  const categories = buildDrinkCategories([
    {
      id: "brand-a",
      nameZh: "测试品牌 A",
      categories: ["奶茶"],
      representativeItems: ["珍珠奶茶", "芋泥奶茶"],
    },
    {
      id: "brand-b",
      nameZh: "测试品牌 B",
      categories: ["奶茶"],
      representativeItems: ["烤奶"],
    },
  ]);

  assert.deepEqual(
    categories[0].items.map(({ name, brandId, brandName }) => ({ name, brandId, brandName })),
    [
      { name: "珍珠奶茶", brandId: "brand-a", brandName: "测试品牌 A" },
      { name: "芋泥奶茶", brandId: "brand-a", brandName: "测试品牌 A" },
      { name: "烤奶", brandId: "brand-b", brandName: "测试品牌 B" },
    ],
  );
  assert.ok(categories[0].items.every((item) => item.id.includes(item.brandId)));
});

test("getBrandsForCategory returns unique brands available in the selected category", () => {
  const categories = buildDrinkCategories([
    {
      id: "brand-a",
      nameZh: "测试品牌 A",
      categories: ["奶茶"],
      representativeItems: ["珍珠奶茶", "芋泥奶茶"],
    },
    {
      id: "brand-b",
      nameZh: "测试品牌 B",
      categories: ["奶茶"],
      representativeItems: ["烤奶"],
    },
  ]);

  assert.deepEqual(getBrandsForCategory(categories[0]), [
    { id: "brand-a", name: "测试品牌 A", itemCount: 2 },
    { id: "brand-b", name: "测试品牌 B", itemCount: 1 },
  ]);
});

test("buildDrinkCategories counts only SKUs that belong to the selected category", () => {
  const categories = buildDrinkCategories([
    {
      id: "mixed-brand",
      nameZh: "混合品牌",
      categories: ["奶茶", "果茶"],
      representativeItems: ["珍珠奶茶", "多肉葡萄", "芋泥波波", "满杯百香果"],
    },
  ]);
  const milkTea = categories.find((category) => category.id === "milk_tea");
  const fruitTea = categories.find((category) => category.id === "fruit_tea");

  assert.deepEqual(milkTea.items.map((item) => item.name), ["珍珠奶茶", "芋泥波波"]);
  assert.deepEqual(fruitTea.items.map((item) => item.name), ["多肉葡萄", "满杯百香果"]);
  assert.deepEqual(getBrandsForCategory(milkTea), [{ id: "mixed-brand", name: "混合品牌", itemCount: 2 }]);
  assert.deepEqual(getBrandsForCategory(fruitTea), [{ id: "mixed-brand", name: "混合品牌", itemCount: 2 }]);
});

test("buildDrinkCategories prefers grouped skus over representative items", () => {
  const categories = buildDrinkCategories([
    {
      id: "sku-brand",
      nameZh: "SKU品牌",
      categories: ["奶茶", "果茶"],
      representativeItems: ["旧奶茶", "旧果茶"],
      skus: {
        奶茶: ["珍珠奶茶", "椰果奶茶", "芋圆奶茶"],
        果茶: ["多肉葡萄", "满杯百香果"],
      },
    },
  ]);
  const milkTea = categories.find((category) => category.id === "milk_tea");
  const fruitTea = categories.find((category) => category.id === "fruit_tea");

  assert.deepEqual(milkTea.items.map((item) => item.name), ["珍珠奶茶", "椰果奶茶", "芋圆奶茶"]);
  assert.deepEqual(fruitTea.items.map((item) => item.name), ["多肉葡萄", "满杯百香果"]);
  assert.deepEqual(getBrandsForCategory(milkTea), [{ id: "sku-brand", name: "SKU品牌", itemCount: 3 }]);
  assert.deepEqual(getBrandsForCategory(fruitTea), [{ id: "sku-brand", name: "SKU品牌", itemCount: 2 }]);
});

test("sampleCandidateItems returns a shuffled capped batch from a category", () => {
  const category = {
    id: "milk_tea",
    name: "奶茶",
    items: [
      { id: "a", name: "A", brandName: "品牌" },
      { id: "b", name: "B", brandName: "品牌" },
      { id: "c", name: "C", brandName: "品牌" },
      { id: "d", name: "D", brandName: "品牌" },
      { id: "e", name: "E", brandName: "品牌" },
      { id: "f", name: "F", brandName: "品牌" },
      { id: "g", name: "G", brandName: "品牌" },
      { id: "h", name: "H", brandName: "品牌" },
      { id: "i", name: "I", brandName: "品牌" },
      { id: "j", name: "J", brandName: "品牌" },
      { id: "k", name: "K", brandName: "品牌" },
      { id: "l", name: "L", brandName: "品牌" },
      { id: "m", name: "M", brandName: "品牌" },
      { id: "n", name: "N", brandName: "品牌" },
      { id: "o", name: "O", brandName: "品牌" },
      { id: "p", name: "P", brandName: "品牌" },
    ],
  };
  const sample = sampleCandidateItems(category, 15);

  assert.equal(sample.length, 15);
  assert.equal(new Set(sample.map((item) => item.id)).size, 15);
  assert.ok(sample.every((item) => category.items.includes(item)));
});

test("sampleCandidateItems can limit candidates to the selected brand", () => {
  const category = {
    id: "milk_tea",
    name: "奶茶",
    items: [
      { id: "a-1", name: "A1", brandId: "a", brandName: "品牌 A" },
      { id: "a-2", name: "A2", brandId: "a", brandName: "品牌 A" },
      { id: "b-1", name: "B1", brandId: "b", brandName: "品牌 B" },
    ],
  };
  const sample = sampleCandidateItems(category, 15, "a");

  assert.equal(sample.length, 2);
  assert.ok(sample.every((item) => item.brandId === "a"));
});
