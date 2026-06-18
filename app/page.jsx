"use client";

import { useEffect, useMemo, useState } from "react";
import { Coffee, RefreshCcw, Shuffle, Sparkles } from "lucide-react";

import brandsData from "../data/brands.json";
import { buildDrinkCategories, getBrandsForCategory, sampleCandidateItems } from "../lib/drinks";

const BATCH_SIZE = 15;
const WHEEL_COLORS = [
  "#ff8aa1",
  "#ffcc5c",
  "#73d7a6",
  "#67c7ff",
  "#b99cff",
  "#ffad66",
  "#6ee7e7",
  "#f78bd3",
];

export default function Home() {
  const categories = useMemo(() => buildDrinkCategories(brandsData.brands), []);
  const initialCategory = categories.find((category) => category.id === "milk_tea") || categories[0];
  const initialBrands = getBrandsForCategory(initialCategory);
  const initialBrandId = initialBrands[0]?.id;
  const [selectedCategoryId, setSelectedCategoryId] = useState("milk_tea");
  const [selectedBrandId, setSelectedBrandId] = useState(initialBrandId);
  const selectedCategory =
    categories.find((category) => category.id === selectedCategoryId) || categories[0];
  const brandOptions = useMemo(() => getBrandsForCategory(selectedCategory), [selectedCategory]);
  const selectedBrand = brandOptions.find((brand) => brand.id === selectedBrandId) || brandOptions[0];
  const activeBrandId = selectedBrand?.id;
  const [candidates, setCandidates] = useState(() =>
    initialCategory.items.filter((item) => item.brandId === initialBrandId).slice(0, BATCH_SIZE),
  );
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    setCandidates(sampleCandidateItems(selectedCategory, BATCH_SIZE, activeBrandId));
  }, [selectedCategory, activeBrandId]);

  function pickCategory(categoryId) {
    const nextCategory = categories.find((category) => category.id === categoryId);
    if (!nextCategory || isSpinning) return;

    const nextBrandId = getBrandsForCategory(nextCategory)[0]?.id;
    setSelectedCategoryId(categoryId);
    setSelectedBrandId(nextBrandId);
    setCandidates(sampleCandidateItems(nextCategory, BATCH_SIZE, nextBrandId));
    setResult(null);
    setRotation((current) => current % 360);
  }

  function randomizeCategory() {
    if (isSpinning) return;
    const nextCategory = categories[Math.floor(Math.random() * categories.length)];
    pickCategory(nextCategory.id);
  }

  function refreshCandidates() {
    if (isSpinning) return;
    setCandidates(sampleCandidateItems(selectedCategory, BATCH_SIZE, activeBrandId));
    setResult(null);
    setRotation((current) => current % 360);
  }

  function pickBrand(brandId) {
    if (!brandId || isSpinning) return;
    setSelectedBrandId(brandId);
    setCandidates(sampleCandidateItems(selectedCategory, BATCH_SIZE, brandId));
    setResult(null);
    setRotation((current) => current % 360);
  }

  function randomizeBrand() {
    if (isSpinning || brandOptions.length === 0) return;
    const nextBrand = brandOptions[Math.floor(Math.random() * brandOptions.length)];
    setSelectedBrandId(nextBrand.id);
    setCandidates(sampleCandidateItems(selectedCategory, BATCH_SIZE, nextBrand.id));
    setResult(null);
    setRotation((current) => current % 360);
  }

  function spin() {
    if (isSpinning || candidates.length === 0) return;

    const winnerIndex = Math.floor(Math.random() * candidates.length);
    const segmentAngle = 360 / candidates.length;
    const segmentCenter = winnerIndex * segmentAngle + segmentAngle / 2;
    const fullTurns = 5 + Math.floor(Math.random() * 3);
    const normalizedRotation = rotation % 360;
    const targetRotation = rotation + fullTurns * 360 + (360 - segmentCenter) - normalizedRotation;

    setResult(null);
    setIsSpinning(true);
    setRotation(targetRotation);

    window.setTimeout(() => {
      setResult(candidates[winnerIndex]);
      setIsSpinning(false);
    }, 3200);
  }

  const hasCandidates = candidates.length > 0;

  return (
    <main className="page-shell">
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">
            <Sparkles size={16} aria-hidden="true" />
            饮品选择困难急救站
          </span>
          <h1>帮你选奶茶</h1>
          <p>不知道喝什么？先选个大类，再让转盘决定今天这一杯。</p>
        </div>
        <div className="today-chip" aria-label={`当前品类：${selectedCategory.name}`}>
          <Coffee size={20} aria-hidden="true" />
          <span>{selectedCategory.name}</span>
          <small>{selectedBrand?.name || "待选品牌"}</small>
        </div>
      </section>

      <section className="picker-layout" aria-label="饮品随机选择器">
        <div className="category-panel">
          <div className="panel-heading">
            <div>
              <p className="section-kicker">先选口味方向</p>
              <h2>饮品大类</h2>
            </div>
            <button className="icon-action" type="button" onClick={randomizeCategory} disabled={isSpinning}>
              <Shuffle size={18} aria-hidden="true" />
              <span>随机品类</span>
            </button>
          </div>

          <div className="category-grid">
            {categories.map((category) => (
              <button
                className={`category-button ${category.id === selectedCategoryId ? "is-active" : ""}`}
                type="button"
                key={category.id}
                onClick={() => pickCategory(category.id)}
                disabled={isSpinning}
              >
                <span>{category.name}</span>
                <small>{category.hint}</small>
              </button>
            ))}
          </div>

          <div className="brand-section">
            <div className="panel-heading compact-heading">
              <div>
                <p className="section-kicker">再选品牌</p>
                <h2>品牌</h2>
              </div>
              <button className="icon-action" type="button" onClick={randomizeBrand} disabled={isSpinning}>
                <Shuffle size={18} aria-hidden="true" />
                <span>随机品牌</span>
              </button>
            </div>

            <div className="brand-grid">
              {brandOptions.map((brand) => (
                <button
                  className={`brand-button ${brand.id === activeBrandId ? "is-active" : ""}`}
                  type="button"
                  key={brand.id}
                  onClick={() => pickBrand(brand.id)}
                  disabled={isSpinning}
                >
                  <span>{brand.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="wheel-panel">
          <div className="wheel-stage">
            <div className="pointer" aria-hidden="true" />
            <DrinkWheel
              candidates={candidates}
              rotation={rotation}
              isSpinning={isSpinning}
              onSpin={spin}
            />
          </div>

          <div className="controls">
            <button
              className="primary-action"
              type="button"
              onClick={spin}
              disabled={isSpinning || !hasCandidates}
            >
              <Sparkles size={20} aria-hidden="true" />
              <span>{isSpinning ? "转盘转动中" : result ? "再转一次" : "开始转"}</span>
            </button>
            <button
              className="secondary-action"
              type="button"
              onClick={refreshCandidates}
              disabled={isSpinning || !hasCandidates}
            >
              <RefreshCcw size={18} aria-hidden="true" />
              <span>换一批</span>
            </button>
          </div>

          <div className={`result-card ${result ? "has-result" : ""}`}>
            <small>今天喝</small>
            <strong>{result?.name || "转一下就知道"}</strong>
            {result ? <span className="result-brand">{result.brandName}</span> : null}
          </div>
        </div>
      </section>
    </main>
  );
}

function DrinkWheel({ candidates, rotation, isSpinning, onSpin }) {
  if (candidates.length === 0) {
    return (
      <div className="empty-wheel">
        <span>暂无饮品</span>
      </div>
    );
  }

  const segmentAngle = 360 / candidates.length;

  return (
    <div className="wheel-frame">
      <svg
        className={`drink-wheel ${isSpinning ? "is-spinning" : ""}`}
        viewBox="0 0 400 400"
        role="img"
        aria-label={`当前转盘候选：${candidates.map((candidate) => `${candidate.brandName} ${candidate.name}`).join("、")}`}
        style={{
          "--wheel-rotation": `${rotation}deg`,
          "--wheel-label-size": candidates.length > 10 ? "11px" : "15px",
        }}
      >
        <circle cx="200" cy="200" r="196" fill="#ffffff" />
        {candidates.map((candidate, index) => {
          const startAngle = index * segmentAngle - 90;
          const endAngle = startAngle + segmentAngle;
          const middleAngle = startAngle + segmentAngle / 2;
          const labelPoint = polarToCartesian(200, 200, 118, middleAngle);
          const textRotation = middleAngle > 90 && middleAngle < 270 ? middleAngle + 180 : middleAngle;

          return (
            <g key={candidate.id}>
              <path
                d={describeArcSlice(200, 200, 186, startAngle, endAngle)}
                fill={WHEEL_COLORS[index % WHEEL_COLORS.length]}
              />
              <text
                x={labelPoint.x}
                y={labelPoint.y}
                transform={`rotate(${textRotation}, ${labelPoint.x}, ${labelPoint.y})`}
                className="wheel-label"
              >
                {truncateLabel(candidate.name, candidates.length)}
              </text>
            </g>
          );
        })}
        <circle cx="200" cy="200" r="58" fill="#fff8ea" stroke="#ffffff" strokeWidth="8" />
      </svg>
      <button
        className="wheel-center-button"
        type="button"
        onClick={onSpin}
        disabled={isSpinning || candidates.length === 0}
        aria-label={isSpinning ? "转盘转动中" : "转动转盘"}
      >
        <span>今日</span>
        <strong>喝什么</strong>
      </button>
    </div>
  );
}

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  const angleInRadians = (angleInDegrees * Math.PI) / 180;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeArcSlice(centerX, centerY, radius, startAngle, endAngle) {
  const start = polarToCartesian(centerX, centerY, radius, endAngle);
  const end = polarToCartesian(centerX, centerY, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    `M ${centerX} ${centerY}`,
    `L ${start.x} ${start.y}`,
    `A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
    "Z",
  ].join(" ");
}

function truncateLabel(label, candidateCount) {
  const maxLength = candidateCount > 10 ? 5 : 7;
  return label.length > maxLength ? `${label.slice(0, maxLength)}...` : label;
}
