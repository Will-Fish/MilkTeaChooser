export const CATEGORY_DEFINITIONS = [
  {
    id: "milk_tea",
    name: "奶茶",
    hint: "奶香、茶香、小料都安排",
    keywords: [
      "奶茶",
      "鲜奶茶",
      "轻乳茶",
      "原叶鲜奶茶",
      "五谷奶茶",
      "烤奶",
      "奶盖茶",
      "芝士茶",
      "玛奇朵",
      "茶拿铁",
    ],
    skuKeywords: [
      "奶茶",
      "奶绿",
      "奶青",
      "烤奶",
      "鲜奶",
      "牛乳",
      "轻乳",
      "波波",
      "啵啵",
      "芋泥",
      "布丁",
      "豆乳",
      "奶芙",
      "阿华田",
      "玛奇朵",
      "烧仙草",
      "伯牙绝弦",
      "桂馥兰香",
      "青青糯山",
      "万里木兰",
      "花田乌龙",
      "幽兰拿铁",
      "声声乌龙",
    ],
  },
  {
    id: "coffee",
    name: "咖啡",
    hint: "清醒一点，顺便快乐一点",
    keywords: [
      "咖啡",
      "拿铁",
      "美式",
      "生椰系列",
      "浓缩咖啡",
      "意式咖啡",
      "手冲",
      "冷萃",
      "冰咖啡",
      "椰乳咖啡",
      "燕麦咖啡",
      "特调咖啡",
      "咖啡豆",
    ],
    skuKeywords: [
      "咖啡",
      "拿铁",
      "美式",
      "澳白",
      "dirty",
      "冷萃",
      "手冲",
      "摩卡",
      "瑞纳冰",
      "馥芮白",
      "生椰",
      "厚乳",
      "燕麦",
      "酱香",
      "橙C",
    ],
  },
  {
    id: "fruit_tea",
    name: "果茶",
    hint: "水果、茶底、清爽口感",
    keywords: ["果茶", "鲜果茶", "柠檬茶", "霸气鲜果茶", "芒果饮品", "果咖"],
    skuKeywords: [
      "果茶",
      "葡萄",
      "莓",
      "百香果",
      "杨枝甘露",
      "橙",
      "柠檬",
      "青提",
      "水蜜桃",
      "水果",
      "芒果",
      "桃",
      "百香",
      "椰奶",
    ],
  },
  {
    id: "pure_tea",
    name: "纯茶",
    hint: "不想太甜，就喝茶",
    keywords: ["纯茶", "原叶茶", "茶饮", "茶瓦纳", "限定茶饮"],
    skuKeywords: ["茉莉", "乌龙", "红茶", "绿茶", "鸭屎香", "云岭茉莉", "初露", "人间烟火"],
  },
  {
    id: "yogurt_smoothie",
    name: "酸奶/冰沙",
    hint: "凉一点、厚一点、甜一点",
    keywords: ["酸奶", "酸奶/冰沙", "冰沙", "冰沙/瑞纳冰", "冰淇淋", "冰淇淋/甜品", "甜品杯"],
    skuKeywords: ["酸奶", "冰沙", "冰淇淋", "星冰乐", "冻冻", "瑞纳冰", "摩天脆脆"],
  },
];

const FALLBACK_BRAND = {
  id: "fallback",
  nameZh: "推荐饮品",
};

const FALLBACK_ITEMS = {
  milk_tea: ["珍珠奶茶", "芋泥波波奶茶", "布丁奶茶", "烤奶", "茉莉奶绿"],
  coffee: ["拿铁", "美式咖啡", "生椰拿铁", "焦糖玛奇朵", "燕麦拿铁"],
  fruit_tea: ["多肉葡萄", "满杯百香果", "杨枝甘露", "柠檬茶", "芝士莓莓"],
  pure_tea: ["茉莉绿茶", "乌龙茶", "红茶", "鸭屎香", "云岭茉莉白"],
  yogurt_smoothie: ["桃桃酸奶", "草莓啵啵酸奶", "芒果冰沙", "抹茶星冰乐", "葡萄冻冻"],
};

export function buildDrinkCategories(brands = []) {
  return CATEGORY_DEFINITIONS.map((definition) => {
    const items = [];
    const seen = new Set();

    for (const brand of brands) {
      if (!matchesDefinition(brand, definition)) continue;

      if (hasGroupedSkus(brand)) {
        for (const [skuGroup, skuItems] of Object.entries(brand.skus)) {
          if (!matchesDefinitionGroup(skuGroup, definition)) continue;
          addDrinkItems(items, seen, brand, skuItems);
        }
      } else {
        for (const item of brand.representativeItems || []) {
          const cleanItem = item.trim();
          if (!matchesSkuDefinition(cleanItem, brand, definition)) continue;
          addDrinkItems(items, seen, brand, [cleanItem]);
        }
      }
    }

    if (items.length === 0) {
      const fallback = FALLBACK_ITEMS[definition.id] || [];
      for (const item of fallback) {
        items.push(createDrinkItem(item, FALLBACK_BRAND));
      }
    }

    return {
      id: definition.id,
      name: definition.name,
      hint: definition.hint,
      items,
    };
  });
}

export function getBrandsForCategory(category) {
  const brandsById = new Map();

  for (const item of category?.items || []) {
    if (!brandsById.has(item.brandId)) {
      brandsById.set(item.brandId, {
        id: item.brandId,
        name: item.brandName,
        itemCount: 0,
      });
    }

    brandsById.get(item.brandId).itemCount += 1;
  }

  return [...brandsById.values()];
}

export function sampleCandidateItems(category, batchSize = 15, brandId) {
  if (!category?.items?.length) return [];
  const items = brandId ? category.items.filter((item) => item.brandId === brandId) : category.items;
  return shuffle(items).slice(0, Math.min(batchSize, items.length));
}

export function shuffle(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function matchesDefinition(brand, definition) {
  const brandCategories = brand.categories || [];
  const skuGroups = Object.keys(brand.skus || {});
  return [...brandCategories, ...skuGroups].some((category) => matchesDefinitionGroup(category, definition));
}

function matchesDefinitionGroup(category, definition) {
  return definition.keywords.some((keyword) => category.includes(keyword));
}

function matchesSkuDefinition(itemName, brand, definition) {
  const normalizedName = itemName.toLowerCase();
  const normalizedKeywords = definition.skuKeywords || definition.keywords;

  if (definition.id === "coffee" && brand.type !== "coffee") {
    return normalizedKeywords.some((keyword) => normalizedName.includes(keyword.toLowerCase())) && /咖啡|美式|摩卡/.test(itemName);
  }

  if (definition.id === "milk_tea" && brand.type === "coffee") {
    return false;
  }

  return normalizedKeywords.some((keyword) => normalizedName.includes(keyword.toLowerCase()));
}

function createDrinkItem(name, brand) {
  const brandId = brand.id || brand.nameEn || brand.nameZh || "brand";
  const brandName = brand.nameZh || brand.nameEn || "未知品牌";

  return {
    id: `${brandId}-${encodeURIComponent(name)}`,
    name,
    brandId,
    brandName,
  };
}

function hasGroupedSkus(brand) {
  return brand.skus && Object.values(brand.skus).some((items) => Array.isArray(items) && items.length > 0);
}

function addDrinkItems(items, seen, brand, skuItems) {
  for (const item of skuItems || []) {
    const cleanItem = item.trim();
    const brandId = brand.id || brand.nameEn || brand.nameZh || "brand";
    const skuKey = `${brandId}:${cleanItem}`;
    if (!cleanItem || seen.has(skuKey)) continue;
    seen.add(skuKey);
    items.push(createDrinkItem(cleanItem, brand));
  }
}
