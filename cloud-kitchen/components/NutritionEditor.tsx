"use client";

import { useState } from "react";
import type { NutritionItem, NutritionLevel } from "@/lib/api";
import {
  BLANK_FOOD,
  LEVELS,
  NUTRIENTS,
  NUTRITION_LIBRARY,
  NUTRITION_TEMPLATES,
  SAMPLE_SHEET,
  SHEET_COLUMNS,
  parseNutritionPaste,
  type PastedMeals,
} from "@/lib/nutrition";

// Column names exactly as in the sheet
const SHEET_LABEL: Record<string, string> = {
  protein: "Protein",
  carbs: "Carbohydrates",
  healthyFats: "Healthy Fats",
  fiber: "Fiber",
};

export type MealKind = "regular" | "combo" | "nutrition";

/**
 * "Mark as Combo Deal" checkbox + (inside it) a "Meal Nutrition" checkbox.
 * Ticking Meal Nutrition moves the combo into the separate health section
 * on the website and opens the ingredient-nutrition editor.
 */
export function ItemTypePicker({
  value,
  onChange,
}: {
  value: MealKind;
  onChange: (v: MealKind) => void;
}) {
  const isCombo = value !== "regular";
  const isNutrition = value === "nutrition";
  return (
    <div className="space-y-3">
      <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-forest/80">
        <input
          type="checkbox"
          checked={isCombo}
          onChange={(e) => onChange(e.target.checked ? "combo" : "regular")}
          className="h-4 w-4 rounded accent-forest"
        />
        Mark as Combo Deal
      </label>

      {isCombo && (
        <label
          className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-3 transition ${
            isNutrition
              ? "border-forest bg-forest/5"
              : "border-dashed border-forest/30 bg-cream hover:border-forest/60"
          }`}
        >
          <input
            type="checkbox"
            checked={isNutrition}
            onChange={(e) => onChange(e.target.checked ? "nutrition" : "combo")}
            className="mt-0.5 h-4 w-4 rounded accent-forest"
          />
          <span>
            <span className="block font-display text-sm font-bold text-forest">
              🥗 Meal Nutrition combo
            </span>
            <span className="block text-xs leading-snug text-forest/60">
              Tick karo to ye combo website par alag &quot;Meal Nutrition&quot; (health)
              section me dikhega, ingredients ke protein / carbs / fiber ke saath.
              Untick = normal Combo Special section.
            </span>
          </span>
        </label>
      )}
    </div>
  );
}

const field =
  "focus-ring w-full rounded-lg border border-forest/20 bg-white px-2 py-1.5 text-sm text-forest outline-none";

/** Editable list of foods (rows of the nutrition sheet) for a Meal Nutrition item. */
export default function NutritionEditor({
  value,
  onChange,
}: {
  value: NutritionItem[];
  onChange: (items: NutritionItem[]) => void;
}) {
  const update = (i: number, patch: Partial<NutritionItem>) =>
    onChange(value.map((f, idx) => (idx === i ? { ...f, ...patch } : f)));
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));
  const has = (name: string) =>
    value.some((f) => f.foodItem.trim().toLowerCase() === name.toLowerCase());

  // ---- Paste from Excel ----
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [pasteErr, setPasteErr] = useState<string | null>(null);
  const [parsed, setParsed] = useState<PastedMeals | null>(null);

  function readPaste(text: string) {
    setPasteText(text);
    setParsed(null);
    setPasteErr(null);
    if (!text.trim()) return;
    const res = parseNutritionPaste(text);
    if ("error" in res) setPasteErr(res.error);
    else {
      setParsed(res);
      // Only one meal in the paste -> nothing to choose, import right away
      if (res.order.length === 1) applyMeal(res, res.order[0]);
    }
  }

  function applyMeal(p: PastedMeals, meal: string) {
    if (
      value.length > 0 &&
      !confirm(`Current ${value.length} foods replace ho jayenge "${meal}" ke foods se. Continue?`)
    )
      return;
    onChange(p.meals[meal].map((f) => ({ ...f })));
    setPasteOpen(false);
    setPasteText("");
    setParsed(null);
  }

  return (
    <div className="space-y-4 rounded-2xl border-2 border-forest/15 bg-creamDark/40 p-4">
      <div>
        <p className="font-display text-sm font-bold text-forest">
          🥗 Ingredient nutrition
        </p>
        <p className="text-xs text-forest/60">
          Yeh table customers ko Meal Nutrition section me dikhegi. Template ya
          quick-add se fill karo, phir values edit kar sakte ho.
        </p>
      </div>

      {/* Templates */}
      <div className="flex flex-wrap gap-2">
        {NUTRITION_TEMPLATES.map((t) => (
          <button
            type="button"
            key={t.label}
            onClick={() => {
              if (
                value.length === 0 ||
                confirm("Current foods replace ho jayenge. Continue?")
              )
                onChange(t.items.map((f) => ({ ...f })));
            }}
            className="focus-ring rounded-full bg-forest px-3 py-1.5 font-display text-xs font-bold text-cream transition hover:bg-tomato"
          >
            ⚡ {t.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onChange([])}
          disabled={value.length === 0}
          className="focus-ring rounded-full border border-forest/20 px-3 py-1.5 font-display text-xs font-semibold text-forest/70 transition hover:bg-forest/5 disabled:opacity-40"
        >
          Clear all
        </button>
      </div>

      {/* Paste from Excel */}
      <div className="rounded-xl border border-forest/20 bg-white">
        <button
          type="button"
          onClick={() => setPasteOpen((o) => !o)}
          aria-expanded={pasteOpen}
          className="focus-ring flex w-full items-center justify-between rounded-xl px-4 py-3 text-left font-display text-sm font-bold text-forest"
        >
          <span>📋 Paste from Excel / Google Sheets</span>
          <span className="text-forest/50">{pasteOpen ? "−" : "+"}</span>
        </button>
        {pasteOpen && (
          <div className="space-y-3 border-t border-forest/10 p-4">
            <p className="text-xs leading-relaxed text-forest/60">
              Sheet me rows select karke copy karo (header optional) aur neeche
              paste karo. Columns ka order:
              <span className="mt-1 block font-semibold text-forest/80">
                {SHEET_COLUMNS}
              </span>
              Sheet me Combo 1 / Combo 2 dono ho to paste ke baad chun sakte ho
              kaunsa import karna hai. &quot;0&quot; = None.
            </p>
            <textarea
              value={pasteText}
              onChange={(e) => readPaste(e.target.value)}
              rows={5}
              placeholder="Yahan paste karo (Ctrl+V)…"
              className={`${field} font-mono text-xs`}
            />
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => readPaste(SAMPLE_SHEET)}
                className="focus-ring rounded-full border border-forest/20 px-3 py-1 text-xs font-semibold text-forest transition hover:bg-forest/5"
              >
                Load sample sheet
              </button>
              {parsed && parsed.order.length > 1 && (
                <>
                  <span className="text-xs font-bold text-forest/60">Import:</span>
                  {parsed.order.map((m) => (
                    <button
                      type="button"
                      key={m}
                      onClick={() => applyMeal(parsed, m)}
                      className="focus-ring rounded-full bg-forest px-3 py-1.5 font-display text-xs font-bold text-cream transition hover:bg-tomato"
                    >
                      {m} ({parsed.meals[m].length} foods)
                    </button>
                  ))}
                </>
              )}
            </div>
            {pasteErr && (
              <p role="alert" className="text-xs font-semibold text-tomato">
                {pasteErr}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Quick-add chips */}
      <div>
        <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-forest/50">
          Quick add
        </p>
        <div className="flex flex-wrap gap-2">
          {NUTRITION_LIBRARY.map((f) => (
            <button
              type="button"
              key={f.foodItem}
              disabled={has(f.foodItem)}
              onClick={() => onChange([...value, { ...f }])}
              className="focus-ring rounded-full border border-forest/20 bg-white px-3 py-1 text-xs font-semibold text-forest transition hover:border-forest disabled:opacity-40"
            >
              {f.emoji} {f.foodItem}
            </button>
          ))}
          <button
            type="button"
            onClick={() => onChange([...value, { ...BLANK_FOOD }])}
            className="focus-ring rounded-full border border-dashed border-forest/40 px-3 py-1 text-xs font-bold text-forest transition hover:bg-forest/5"
          >
            + Custom food
          </button>
        </div>
      </div>

      {/* Rows */}
      {value.length === 0 ? (
        <p className="rounded-xl border border-dashed border-forest/25 bg-white/60 px-4 py-6 text-center text-sm text-forest/60">
          Abhi koi food add nahi hua. Upar se template ya quick-add use karo.
        </p>
      ) : (
        <div className="space-y-3">
          {value.map((f, i) => (
            <div
              key={i}
              className="rounded-xl border border-forest/15 bg-card p-3 shadow-sm"
            >
              <div className="grid grid-cols-[3.5rem_1fr_auto] items-center gap-2">
                <input
                  aria-label="Emoji"
                  value={f.emoji}
                  maxLength={4}
                  onChange={(e) => update(i, { emoji: e.target.value })}
                  className={`${field} text-center text-lg`}
                />
                <input
                  aria-label="Food item"
                  placeholder="Food item (e.g. Watermelon)"
                  value={f.foodItem}
                  onChange={(e) => update(i, { foodItem: e.target.value })}
                  className={`${field} font-semibold`}
                />
                <button
                  type="button"
                  aria-label={`Remove ${f.foodItem || "food"}`}
                  onClick={() => remove(i)}
                  className="focus-ring rounded-lg p-2 text-forest/40 transition hover:bg-tomato/10 hover:text-tomato"
                >
                  🗑️
                </button>
              </div>

              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {NUTRIENTS.map((n) => (
                  <label key={n.key} className="block">
                    <span className="mb-0.5 block text-[10px] font-bold uppercase tracking-wide text-forest/50">
                      {SHEET_LABEL[n.key]}
                    </span>
                    <select
                      value={f[n.key]}
                      onChange={(e) =>
                        update(i, { [n.key]: e.target.value as NutritionLevel })
                      }
                      className={field}
                    >
                      {LEVELS.map((l) => (
                        <option key={l} value={l}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>

              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <input
                  aria-label="Vitamins and minerals"
                  placeholder="Vitamins & minerals (e.g. High (vitamin C, A))"
                  value={f.vitamins}
                  onChange={(e) => update(i, { vitamins: e.target.value })}
                  className={field}
                />
                <input
                  aria-label="Main benefit"
                  placeholder="Main benefit (e.g. Hydration + energy)"
                  value={f.benefit}
                  onChange={(e) => update(i, { benefit: e.target.value })}
                  className={field}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
