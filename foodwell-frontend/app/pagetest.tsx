"use client";

import { useState, useEffect } from "react";

const BASE_URL = "http://localhost:8000";

// ── Health Profile Types ───────────────────────────────────────────────────
interface HealthProfile {
  age: string; gender: string;
  weight: string; weight_unit: "kg" | "lbs";
  height: string; height_unit: "cm" | "ft";
  goal: string; activity_level: string;
  diet_type: string; allergies: string[]; intolerances: string[];
  conditions: string[]; meals_per_day: string;
  cuisine_preferences: string[]; disliked_ingredients: string;
}
const EMPTY_PROFILE: HealthProfile = {
  age: "", gender: "", weight: "", weight_unit: "kg", height: "", height_unit: "cm",
  goal: "", activity_level: "", diet_type: "none", allergies: [], intolerances: [],
  conditions: [], meals_per_day: "3", cuisine_preferences: [], disliked_ingredients: "",
};

// ── Option Lists ───────────────────────────────────────────────────────────
const GOALS = [
  { value: "lose_weight", label: "Lose Weight", icon: "📉" },
  { value: "maintain", label: "Maintain", icon: "⚖️" },
  { value: "gain_muscle", label: "Gain Muscle", icon: "💪" },
  { value: "eat_healthier", label: "Eat Healthier", icon: "🥗" },
  { value: "manage_condition", label: "Manage Condition", icon: "🩺" },
];
const ACTIVITY_LEVELS = [
  { value: "sedentary", label: "Sedentary", sub: "Little or no exercise" },
  { value: "light", label: "Lightly Active", sub: "1–3 days/week" },
  { value: "moderate", label: "Moderate", sub: "3–5 days/week" },
  { value: "active", label: "Very Active", sub: "6–7 days/week" },
  { value: "athlete", label: "Athlete", sub: "2× per day" },
];
const DIET_TYPES = [
  { value: "none", label: "No Restriction" }, { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" }, { value: "keto", label: "Keto" },
  { value: "paleo", label: "Paleo" }, { value: "mediterranean", label: "Mediterranean" },
  { value: "gluten_free", label: "Gluten-Free" }, { value: "dairy_free", label: "Dairy-Free" },
];
const ALLERGIES = ["Nuts", "Peanuts", "Shellfish", "Fish", "Eggs", "Soy", "Wheat", "Sesame", "Milk"];
const INTOLERANCES = ["Lactose", "Gluten", "Fructose", "Histamine", "FODMAPs"];
const CONDITIONS = ["Diabetes", "Hypertension", "High Cholesterol", "IBS", "PCOS", "Thyroid", "Celiac", "Gout"];
const CUISINES = ["Indian", "Mediterranean", "East Asian", "Mexican", "Italian", "Middle Eastern", "American", "Thai", "Japanese"];
const HP_STEPS = [
  { id: 1, label: "Basics", icon: "👤" },
  { id: 2, label: "Goals", icon: "🎯" },
  { id: 3, label: "Diet", icon: "🥦" },
  { id: 4, label: "Health", icon: "🩺" },
  { id: 5, label: "Preferences", icon: "✨" },
];

// ── Main Component ─────────────────────────────────────────────────────────
export default function Home() {
  // Pantry & Meals state
  const [pantry, setPantry] = useState<any[]>([]);
  const [meals, setMeals] = useState<any>(null);
  const [clearingPantry, setClearingPantry] = useState(false);
  const [nutritionMap, setNutritionMap] = useState<Record<string, any>>({});
  const [loadingNutrition, setLoadingNutrition] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [mealsError, setMealsError] = useState<string>("");
  const [uploadError, setUploadError] = useState<string>("");
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState<"pantry" | "meals" | "profile">("pantry");

  // Health Profile state
  const [profile, setProfile] = useState<HealthProfile>(EMPTY_PROFILE);
  const [hpStep, setHpStep] = useState(1);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState("");

  useEffect(() => {
    fetchPantry();
    fetchProfile();
  }, []);

  // ── Pantry & Meals ──────────────────────────────────────────────────────
  const fetchPantry = async () => {
    const res = await fetch(`${BASE_URL}/pantry/`);
    const data = await res.json();
    setPantry(data);
  };

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${BASE_URL}/health-profile`);
      if (!res.ok) return;
      const data = await res.json();
      if (data) setProfile(data);
    } catch (err) {
      console.error("Failed to fetch health profile:", err);
    }
  };

  const clearPantry = async () => {
    if (pantry.length === 0 || clearingPantry) return;
    const confirmed = window.confirm("Clear all pantry items? This cannot be undone.");
    if (!confirmed) return;

    setClearingPantry(true);
    try {
      const res = await fetch(`${BASE_URL}/pantry/clear`, { method: "DELETE" });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);

      // Clear dependent UI state as well.
      setMeals(null);
      setNutritionMap({});
      setLoadingNutrition({});

      await fetchPantry();
      setActiveTab("pantry");
    } catch (err) {
      console.error("Clear pantry failed:", err);
    } finally {
      setClearingPantry(false);
    }
  };

  const processFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    setLoading(true);
    setUploadSuccess(false);
    setUploadError("");
    try {
      const res = await fetch(`${BASE_URL}/invoice/upload`, { method: "POST", body: formData });
      if (!res.ok) {
        const bodyText = await res.text().catch(() => "");
        throw new Error(bodyText || `Invoice upload failed (${res.status})`);
      }
      await fetchPantry();
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (err: any) {
      console.error("Invoice upload failed:", err);
      setUploadError(err?.message || "Failed to process invoice");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (file) processFile(file);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files?.[0]; if (file) processFile(file);
  };

  const generateMeals = async () => {
    setLoading(true);
    setMeals(null);
    setMealsError("");
    try {
      const res = await fetch(`${BASE_URL}/meal/generate`);
      if (!res.ok) {
        let msg = `Meal generation failed (${res.status})`;
        try {
          const j = await res.json();
          msg = j?.detail || msg;
        } catch {
          const t = await res.text().catch(() => "");
          if (t) msg = t;
        }
        throw new Error(msg);
      }
      const data = await res.json();
      setMeals(data); setActiveTab("meals");
    } catch (err: any) {
      console.error("Meals generation failed:", err);
      setMealsError(err?.message || "Failed to generate meals");
    } finally {
      setLoading(false);
    }
  };

  const toggleNutrition = async (mealName: string) => {
    if (nutritionMap[mealName]) {
      setNutritionMap(prev => { const n = {...prev}; delete n[mealName]; return n; }); return;
    }
    setLoadingNutrition(prev => ({ ...prev, [mealName]: true }));
    try {
      const res = await fetch(`${BASE_URL}/nutrition/${encodeURIComponent(mealName)}`);
      const data = await res.json();
      setNutritionMap(prev => ({ ...prev, [mealName]: data }));
    } catch (err) { console.error(err); }
    finally { setLoadingNutrition(prev => ({ ...prev, [mealName]: false })); }
  };

  // ── Health Profile ──────────────────────────────────────────────────────
  const setP = (key: keyof HealthProfile, value: any) =>
    setProfile(prev => ({ ...prev, [key]: value }));

  const toggleArr = (key: keyof HealthProfile, value: string) => {
    const arr = profile[key] as string[];
    setP(key, arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value]);
  };

  const hpCanNext = () => {
    if (hpStep === 1) return profile.age && profile.gender && profile.weight && profile.height;
    if (hpStep === 2) return profile.goal && profile.activity_level;
    return true;
  };

  const saveProfile = async () => {
    setSavingProfile(true); setProfileError("");
    try {
      const res = await fetch(`${BASE_URL}/health-profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } catch (err: any) { setProfileError(err.message || "Failed to save"); }
    finally { setSavingProfile(false); }
  };

  // ── Derived ──────────────────────────────────────────────────────────────
  const expiringCount = pantry.filter(i => i.status?.includes("expiring")).length;
  const soonCount     = pantry.filter(i => i.status?.includes("soon")).length;
  const freshCount    = pantry.filter(i => !i.status?.includes("expiring") && !i.status?.includes("soon")).length;

  // ── Sub-components ───────────────────────────────────────────────────────
  const MealCard = ({ meal, index, mealType }: { meal: any; index: number; mealType?: string }) => {
    const name = meal.meal_name || meal.name || meal.dish || mealType || "";
    const nutrition = nutritionMap[name];
    const isLoadingNutri = loadingNutrition[name];
    return (
      <div className="meal-card">
        <div className="meal-card-inner">
          <div className="meal-number">{mealType || `Suggestion ${index + 1}`}</div>
          <div className="meal-name serif">{name}</div>
          {meal.description && <p className="meal-desc">{meal.description}</p>}
          <div className="ingredient-chips">
            {(meal.ingredients_used || []).map((ing: string, j: number) => (
              <span key={j} className="chip">{ing}</span>
            ))}
          </div>
          <button className={`nutri-toggle${nutrition ? " active" : ""}`} onClick={() => toggleNutrition(name)} disabled={isLoadingNutri}>
            {isLoadingNutri ? <span className="nutri-spinner" /> : nutrition ? "✕ Hide Nutrition" : "📊 Nutrition Info"}
          </button>
        </div>
        <div className={`nutri-panel${nutrition ? " open" : ""}`}>
          {nutrition && (
            <div className="nutri-grid">
              {[["🔥", nutrition.calories, "kcal"], ["💪", `${nutrition.protein}g`, "Protein"], ["🌾", `${nutrition.carbs}g`, "Carbs"], ["🥑", `${nutrition.fat}g`, "Fat"]].map(([icon, val, lbl]) => (
                <div key={lbl} className="nutri-stat">
                  <span className="nutri-icon">{icon}</span>
                  <span className="nutri-value">{val}</span>
                  <span className="nutri-label">{lbl}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const Chip = ({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button type="button" onClick={onClick} className={`choice-chip${selected ? " selected" : ""}`}>{children}</button>
  );

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --cream: #F7F4EE; --parchment: #EDE9DF;
          --sage: #4A6741; --sage-light: #6B8F62; --sage-muted: #C8D8C4;
          --terra: #C4622D; --amber: #D4913A;
          --charcoal: #2C2C2A; --muted: #8A8780;
          --red-soft: #E8C5B8; --yellow-soft: #EEE0BC; --green-soft: #C4D9BF;
        }
        body { font-family: 'DM Sans', sans-serif; background: var(--cream); color: var(--charcoal); -webkit-font-smoothing: antialiased; }
        .serif { font-family: 'DM Serif Display', Georgia, serif; }
        .app { display: flex; min-height: 100vh; }

        /* ── SIDEBAR ── */
        .sidebar { width: 260px; min-width: 260px; background: var(--charcoal); display: flex; flex-direction: column; padding: 32px 24px; position: sticky; top: 0; height: 100vh; overflow: hidden; }
        .sidebar-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
        .logo-icon { width: 36px; height: 36px; background: var(--sage); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; }
        .logo-text { font-family: 'DM Serif Display', serif; font-size: 22px; color: var(--cream); letter-spacing: -0.3px; }
        .sidebar-tagline { font-size: 11px; color: var(--muted); letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 40px; padding-left: 46px; }
        .sidebar-divider { height: 1px; background: rgba(255,255,255,0.07); margin: 20px 0; }
        .sidebar-label { font-size: 10px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); margin-bottom: 12px; }
        .stat-row { display: flex; flex-direction: column; gap: 8px; margin-bottom: 24px; }
        .stat-chip { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; border-radius: 10px; font-size: 13px; font-weight: 500; }
        .stat-chip.red { background: rgba(196,98,45,0.18); color: #E8916A; }
        .stat-chip.amber { background: rgba(212,145,58,0.18); color: #E8B96A; }
        .stat-chip.green { background: rgba(74,103,65,0.22); color: #8FBF85; }
        .stat-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; margin-right: 8px; }
        .stat-dot.red { background: #C4622D; } .stat-dot.amber { background: #D4913A; } .stat-dot.green { background: var(--sage-light); }
        .sidebar-nav { flex: 1; display: flex; flex-direction: column; gap: 4px; }
        .nav-item { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 10px; font-size: 13px; font-weight: 500; color: var(--muted); cursor: pointer; transition: all 0.15s ease; border: none; background: none; text-align: left; width: 100%; }
        .nav-item:hover { background: rgba(255,255,255,0.05); color: var(--cream); }
        .nav-item.active { background: rgba(255,255,255,0.1); color: var(--cream); }
        .nav-icon { font-size: 16px; width: 20px; text-align: center; }
        .sidebar-footer { padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.07); }
        .user-card { display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 12px; background: rgba(255,255,255,0.06); }
        .avatar { width: 34px; height: 34px; background: var(--sage); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 14px; color: white; }
        .user-name { font-size: 13px; color: var(--cream); font-weight: 500; }
        .user-sub { font-size: 11px; color: var(--muted); }

        /* ── MAIN ── */
        .main { flex: 1; padding: 40px 48px; overflow-y: auto; }
        .main-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
        .page-title { font-family: 'DM Serif Display', serif; font-size: 36px; color: var(--charcoal); line-height: 1.1; letter-spacing: -0.5px; }
        .page-title em { color: var(--sage); font-style: italic; }
        .page-sub { font-size: 14px; color: var(--muted); margin-top: 6px; }
        .header-actions { display: flex; gap: 12px; align-items: center; }
        .btn-primary { display: inline-flex; align-items: center; gap: 8px; background: var(--sage); color: white; border: none; padding: 12px 22px; border-radius: 100px; font-size: 14px; font-weight: 500; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.2s ease; white-space: nowrap; }
        .btn-primary:hover { background: var(--sage-light); transform: translateY(-1px); box-shadow: 0 6px 20px rgba(74,103,65,0.3); }
        .btn-primary:active { transform: translateY(0); }
        .btn-primary:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }
        .btn-ghost { display: inline-flex; align-items: center; gap: 8px; background: transparent; color: var(--muted); border: 1.5px solid var(--parchment); padding: 11px 20px; border-radius: 100px; font-size: 14px; font-weight: 500; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.2s ease; }
        .btn-ghost:hover { border-color: var(--sage-muted); color: var(--sage); }

        /* ── UPLOAD ── */
        .upload-zone { border: 2px dashed var(--sage-muted); border-radius: 20px; padding: 48px 32px; text-align: center; background: white; cursor: pointer; transition: all 0.2s ease; margin-bottom: 32px; position: relative; overflow: hidden; }
        .upload-zone::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse at 60% 0%, rgba(74,103,65,0.04) 0%, transparent 70%); pointer-events: none; }
        .upload-zone:hover, .upload-zone.drag-over { border-color: var(--sage); background: rgba(74,103,65,0.03); }
        .upload-icon-wrap { width: 60px; height: 60px; background: var(--parchment); border-radius: 16px; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; font-size: 26px; transition: transform 0.2s ease; }
        .upload-zone:hover .upload-icon-wrap { transform: scale(1.08); }
        .upload-title { font-size: 16px; font-weight: 600; color: var(--charcoal); margin-bottom: 6px; }
        .upload-sub { font-size: 13px; color: var(--muted); margin-bottom: 20px; }
        .upload-formats { display: flex; gap: 8px; justify-content: center; margin-bottom: 20px; }
        .format-tag { font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 100px; background: var(--parchment); color: var(--muted); letter-spacing: 0.04em; text-transform: uppercase; }
        .upload-btn-label { display: inline-flex; align-items: center; gap: 8px; background: var(--sage); color: white; padding: 11px 24px; border-radius: 100px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s ease; }
        .upload-btn-label:hover { background: var(--sage-light); }
        .upload-success-banner { position: absolute; bottom: 0; left: 0; right: 0; background: var(--sage); color: white; font-size: 13px; font-weight: 500; padding: 10px; text-align: center; animation: slideUp 0.3s ease; }
        .loading-bar { position: absolute; bottom: 0; left: 0; height: 3px; background: var(--sage); animation: loadPulse 1.2s ease-in-out infinite; width: 60%; border-radius: 2px; }
        @keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes loadPulse { 0% { left: -60%; width: 60%; } 100% { left: 100%; width: 60%; } }
        @keyframes fadeSlide { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        /* ── TABS ── */
        .tabs { display: flex; gap: 4px; background: var(--parchment); padding: 4px; border-radius: 14px; margin-bottom: 24px; width: fit-content; }
        .tab { padding: 9px 22px; border-radius: 10px; font-size: 13px; font-weight: 500; cursor: pointer; border: none; background: none; color: var(--muted); font-family: 'DM Sans', sans-serif; transition: all 0.15s ease; }
        .tab.active { background: white; color: var(--charcoal); box-shadow: 0 1px 4px rgba(0,0,0,0.08); }

        /* ── PANTRY ── */
        .pantry-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 14px; }
        .pantry-card { border-radius: 18px; padding: 18px 20px; display: flex; flex-direction: column; gap: 12px; transition: all 0.25s ease; }
        .pantry-card:hover { transform: translateY(-4px) scale(1.01); box-shadow: 0 14px 40px rgba(0,0,0,0.1); }
        .pantry-card.fresh { background: white; border: 1.5px solid var(--green-soft); }
        .pantry-card.soon { background: #FFFBF0; border: 1.5px solid var(--yellow-soft); }
        .pantry-card.expiring { background: #FFF8F5; border: 1.5px solid var(--red-soft); }
        .card-top { display: flex; justify-content: space-between; align-items: flex-start; }
        .item-name { font-size: 14px; font-weight: 600; color: var(--charcoal); flex: 1; line-height: 1.3; }
        .item-qty { font-size: 12px; font-weight: 600; padding: 3px 10px; border-radius: 100px; margin-left: 8px; }
        .fresh .item-qty { background: var(--green-soft); color: var(--sage); }
        .soon .item-qty { background: var(--yellow-soft); color: #8A6A20; }
        .expiring .item-qty { background: var(--red-soft); color: #8A3820; }
        .status-row { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 500; }
        .status-dot { width: 7px; height: 7px; border-radius: 50%; }
        .fresh .status-dot { background: var(--sage-light); } .soon .status-dot { background: var(--amber); } .expiring .status-dot { background: var(--terra); }
        .fresh .status-text { color: var(--sage); } .soon .status-text { color: #8A6A20; } .expiring .status-text { color: var(--terra); }
        .empty-state { grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--muted); }
        .empty-icon { font-size: 48px; margin-bottom: 16px; opacity: 0.5; }
        .empty-title { font-size: 16px; font-weight: 600; color: var(--charcoal); margin-bottom: 6px; }
        .empty-sub { font-size: 14px; }

        /* ── MEALS ── */
        .meals-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
        .meal-card { background: white; border-radius: 22px; border: 1.5px solid var(--parchment); overflow: hidden; transition: transform 0.25s ease, box-shadow 0.25s ease; }
        .meal-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.09); }
        .meal-card-inner { padding: 24px 24px 20px; }
        .meal-number { font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--sage); margin-bottom: 8px; }
        .meal-name { font-family: 'DM Serif Display', serif; font-size: 20px; color: var(--charcoal); margin-bottom: 10px; line-height: 1.25; }
        .meal-desc { font-size: 13px; color: var(--muted); margin-bottom: 14px; line-height: 1.5; }
        .ingredient-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px; }
        .chip { font-size: 11px; font-weight: 500; padding: 5px 11px; background: var(--parchment); color: var(--charcoal); border-radius: 100px; }
        .chip:hover { background: var(--sage-muted); color: var(--sage); }
        .nutri-toggle { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; padding: 7px 14px; border-radius: 100px; border: 1.5px solid var(--parchment); background: white; color: var(--muted); cursor: pointer; transition: all 0.2s ease; font-family: 'DM Sans', sans-serif; }
        .nutri-toggle:hover { border-color: var(--sage-muted); color: var(--sage); background: rgba(74,103,65,0.04); }
        .nutri-toggle.active { background: var(--sage); color: white; border-color: var(--sage); }
        .nutri-toggle:disabled { opacity: 0.5; cursor: not-allowed; }
        .nutri-spinner { display: inline-block; width: 12px; height: 12px; border: 2px solid rgba(74,103,65,0.2); border-top-color: var(--sage); border-radius: 50%; animation: spin 0.6s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .nutri-panel { max-height: 0; overflow: hidden; transition: max-height 0.35s ease, opacity 0.3s ease; opacity: 0; }
        .nutri-panel.open { max-height: 120px; opacity: 1; }
        .nutri-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: var(--parchment); border-top: 1.5px solid var(--parchment); }
        .nutri-stat { background: var(--cream); padding: 14px 12px; display: flex; flex-direction: column; align-items: center; gap: 3px; text-align: center; }
        .nutri-icon { font-size: 18px; line-height: 1; margin-bottom: 2px; }
        .nutri-value { font-family: 'DM Serif Display', serif; font-size: 17px; color: var(--charcoal); line-height: 1; }
        .nutri-label { font-size: 10px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; color: var(--muted); }
        .meals-empty { text-align: center; padding: 80px 20px; color: var(--muted); }
        .meals-empty-icon { font-size: 52px; margin-bottom: 20px; }
        .meals-empty-title { font-family: 'DM Serif Display', serif; font-size: 22px; color: var(--charcoal); margin-bottom: 8px; }
        .meals-empty-sub { font-size: 14px; margin-bottom: 28px; }

        /* ── SUMMARY ── */
        .summary-strip { display: flex; gap: 16px; margin-bottom: 28px; }
        .summary-card { flex: 1; background: white; border-radius: 16px; padding: 18px 20px; border: 1.5px solid var(--parchment); display: flex; flex-direction: column; gap: 4px; }
        .summary-value { font-family: 'DM Serif Display', serif; font-size: 28px; line-height: 1; color: var(--charcoal); }
        .summary-label { font-size: 12px; color: var(--muted); font-weight: 500; }

        /* ── HEALTH PROFILE STEPPER ── */
        .stepper { display: flex; align-items: flex-start; margin-bottom: 36px; }
        .step-item { display: flex; flex-direction: column; align-items: center; gap: 6px; flex: 1; position: relative; }
        .step-item:not(:last-child)::after { content: ''; position: absolute; top: 18px; left: 50%; width: 100%; height: 2px; background: var(--parchment); z-index: 0; transition: background 0.3s ease; }
        .step-item.done:not(:last-child)::after { background: var(--sage-muted); }
        .step-bubble { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; border: 2px solid var(--parchment); background: white; color: var(--muted); transition: all 0.2s ease; position: relative; z-index: 1; }
        .step-item.active .step-bubble { border-color: var(--sage); background: var(--sage); color: white; box-shadow: 0 0 0 4px rgba(74,103,65,0.12); }
        .step-item.done .step-bubble { border-color: var(--sage-muted); background: var(--sage-muted); color: var(--sage); }
        .step-label { font-size: 11px; font-weight: 600; letter-spacing: 0.04em; color: var(--muted); }
        .step-item.active .step-label { color: var(--sage); }
        .step-item.done .step-label { color: var(--charcoal); }

        /* ── HEALTH PROFILE FORM CARD ── */
        .form-card { background: white; border-radius: 24px; border: 1.5px solid var(--parchment); overflow: hidden; animation: fadeSlide 0.25s ease; max-width: 720px; }
        .form-card-header { padding: 32px 36px 24px; border-bottom: 1.5px solid var(--parchment); background: linear-gradient(135deg, rgba(74,103,65,0.04) 0%, transparent 60%); }
        .form-card-title { font-family: 'DM Serif Display', serif; font-size: 24px; color: var(--charcoal); margin-bottom: 4px; }
        .form-card-sub { font-size: 13px; color: var(--muted); }
        .form-card-body { padding: 32px 36px; display: flex; flex-direction: column; gap: 28px; }
        .form-footer { display: flex; justify-content: space-between; align-items: center; padding: 24px 36px; border-top: 1.5px solid var(--parchment); background: var(--cream); }
        .step-counter { font-size: 12px; color: var(--muted); font-weight: 500; }

        /* ── FORM FIELDS ── */
        .field-group { display: flex; flex-direction: column; gap: 8px; }
        .field-label { font-size: 13px; font-weight: 600; color: var(--charcoal); }
        .field-hint { font-size: 12px; color: var(--muted); margin-top: -4px; }
        .input { width: 100%; padding: 12px 16px; border-radius: 12px; border: 1.5px solid var(--parchment); background: var(--cream); font-size: 14px; font-family: 'DM Sans', sans-serif; color: var(--charcoal); outline: none; transition: border-color 0.15s ease; }
        .input:focus { border-color: var(--sage); background: white; }
        .input::placeholder { color: var(--muted); }
        textarea.input { resize: vertical; min-height: 80px; }
        .input-row { display: flex; gap: 12px; align-items: flex-end; }
        .input-row .input { flex: 1; }
        .unit-select { padding: 12px 14px; border-radius: 12px; border: 1.5px solid var(--parchment); background: var(--cream); font-size: 13px; font-weight: 600; font-family: 'DM Sans', sans-serif; color: var(--charcoal); outline: none; cursor: pointer; min-width: 72px; }
        .unit-select:focus { border-color: var(--sage); }
        .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .gender-row { display: flex; gap: 8px; }
        .gender-btn { flex: 1; padding: 12px; border-radius: 12px; border: 1.5px solid var(--parchment); background: white; font-size: 13px; font-weight: 600; font-family: 'DM Sans', sans-serif; color: var(--muted); cursor: pointer; transition: all 0.15s ease; text-align: center; }
        .gender-btn:hover { border-color: var(--sage-muted); color: var(--charcoal); }
        .gender-btn.selected { background: var(--sage); border-color: var(--sage); color: white; }

        /* ── GOAL & ACTIVITY CARDS ── */
        .goal-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 10px; }
        .goal-card { padding: 16px 12px; border-radius: 16px; border: 1.5px solid var(--parchment); background: white; text-align: center; cursor: pointer; transition: all 0.2s ease; }
        .goal-card:hover { border-color: var(--sage-muted); transform: translateY(-2px); }
        .goal-card.selected { border-color: var(--sage); background: rgba(74,103,65,0.05); }
        .goal-card-icon { font-size: 24px; margin-bottom: 8px; }
        .goal-card-label { font-size: 12px; font-weight: 600; color: var(--charcoal); }
        .activity-list { display: flex; flex-direction: column; gap: 8px; }
        .activity-card { display: flex; align-items: center; justify-content: space-between; padding: 14px 18px; border-radius: 14px; border: 1.5px solid var(--parchment); background: white; cursor: pointer; transition: all 0.15s ease; }
        .activity-card:hover { border-color: var(--sage-muted); }
        .activity-card.selected { border-color: var(--sage); background: rgba(74,103,65,0.04); }
        .activity-label { font-size: 13px; font-weight: 600; color: var(--charcoal); }
        .activity-sub { font-size: 12px; color: var(--muted); }
        .activity-check { width: 20px; height: 20px; border-radius: 50%; border: 2px solid var(--parchment); display: flex; align-items: center; justify-content: center; transition: all 0.15s ease; flex-shrink: 0; }
        .activity-card.selected .activity-check { background: var(--sage); border-color: var(--sage); }
        .check-dot { width: 8px; height: 8px; border-radius: 50%; background: white; }

        /* ── CHOICE CHIPS & DIET PILLS ── */
        .chips-grid { display: flex; flex-wrap: wrap; gap: 8px; }
        .choice-chip { padding: 9px 16px; border-radius: 100px; border: 1.5px solid var(--parchment); background: white; font-size: 13px; font-weight: 500; font-family: 'DM Sans', sans-serif; color: var(--muted); cursor: pointer; transition: all 0.15s ease; white-space: nowrap; }
        .choice-chip:hover { border-color: var(--sage-muted); color: var(--charcoal); }
        .choice-chip.selected { background: var(--sage); border-color: var(--sage); color: white; }
        .diet-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 8px; }
        .diet-pill { padding: 11px 14px; border-radius: 12px; border: 1.5px solid var(--parchment); background: white; font-size: 13px; font-weight: 500; font-family: 'DM Sans', sans-serif; color: var(--muted); cursor: pointer; transition: all 0.15s ease; text-align: center; }
        .diet-pill:hover { border-color: var(--sage-muted); color: var(--charcoal); }
        .diet-pill.selected { background: var(--sage); border-color: var(--sage); color: white; }

        /* ── MEALS COUNTER ── */
        .meals-counter { display: flex; align-items: center; gap: 16px; }
        .counter-btn { width: 36px; height: 36px; border-radius: 50%; border: 1.5px solid var(--parchment); background: white; font-size: 18px; font-weight: 600; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.15s ease; color: var(--charcoal); }
        .counter-btn:hover { border-color: var(--sage); color: var(--sage); }
        .counter-value { font-family: 'DM Serif Display', serif; font-size: 28px; color: var(--charcoal); min-width: 32px; text-align: center; }
        .counter-label { font-size: 13px; color: var(--muted); }

        /* ── SAVE BANNERS ── */
        .save-banner { display: flex; align-items: center; gap: 8px; padding: 12px 20px; background: rgba(74,103,65,0.1); border: 1.5px solid var(--sage-muted); border-radius: 12px; font-size: 13px; font-weight: 500; color: var(--sage); animation: fadeSlide 0.3s ease; }
        .error-banner { display: flex; align-items: center; gap: 8px; padding: 12px 20px; background: rgba(196,98,45,0.08); border: 1.5px solid var(--red-soft); border-radius: 12px; font-size: 13px; color: var(--terra); }

        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: var(--parchment); border-radius: 3px; }
        @media (max-width: 960px) {
          .sidebar { display: none; } .main { padding: 24px 20px; } .page-title { font-size: 26px; } .summary-strip { flex-wrap: wrap; }
          .nutri-grid { grid-template-columns: repeat(2, 1fr); } .nutri-panel.open { max-height: 200px; }
          .two-col { grid-template-columns: 1fr; } .form-card-body { padding: 24px 20px; } .form-card-header { padding: 24px 20px; } .form-footer { padding: 20px; }
        }
      `}</style>

      <div className="app">

        {/* ── SIDEBAR ── */}
        <aside className="sidebar">
          <div>
            <div className="sidebar-logo">
              <div className="logo-icon">🌿</div>
              <span className="logo-text">FoodHack</span>
            </div>
            <p className="sidebar-tagline">AI pantry intelligence</p>

            <div className="sidebar-label">Pantry Health</div>
            <div className="stat-row">
              {expiringCount > 0 && <div className="stat-chip red"><span><span className="stat-dot red" style={{display:'inline-block'}}></span>Expiring soon</span><strong>{expiringCount}</strong></div>}
              {soonCount > 0 && <div className="stat-chip amber"><span><span className="stat-dot amber" style={{display:'inline-block'}}></span>Use this week</span><strong>{soonCount}</strong></div>}
              <div className="stat-chip green"><span><span className="stat-dot green" style={{display:'inline-block'}}></span>Fresh items</span><strong>{freshCount}</strong></div>
            </div>

            <div className="sidebar-divider" />
            <p className="sidebar-label">Navigation</p>
            <div className="sidebar-nav">
              <button className={`nav-item${activeTab === "pantry" ? " active" : ""}`} onClick={() => setActiveTab("pantry")}><span className="nav-icon">📦</span> Pantry</button>
              <button className={`nav-item${activeTab === "meals" ? " active" : ""}`} onClick={() => setActiveTab("meals")}><span className="nav-icon">🍽️</span> Meal Plans</button>
              <button className={`nav-item${activeTab === "profile" ? " active" : ""}`} onClick={() => setActiveTab("profile")}><span className="nav-icon">🧬</span> Health Profile</button>
            </div>
          </div>
          <div className="sidebar-footer">
            <div className="user-card">
              <div className="avatar">U</div>
              <div>
                <div className="user-name">My Kitchen</div>
                <div className="user-sub">{pantry.length} items tracked</div>
              </div>
            </div>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <main className="main">
          <div className="main-header">
            <div>
              <h1 className="page-title serif">
                {activeTab === "pantry" && <>Your <em>Pantry</em></>}
                {activeTab === "meals"   && <>Meal <em>Suggestions</em></>}
                {activeTab === "profile" && <>Health <em>Profile</em></>}
              </h1>
              <p className="page-sub">
                {activeTab === "pantry"  && "Upload a grocery invoice to auto-populate your pantry"}
                {activeTab === "meals"   && "AI-generated meals based on your current pantry"}
                {activeTab === "profile" && "Tell us about you — we'll personalise your meal plans"}
              </p>
            </div>
            {activeTab !== "profile" && (
              <div className="header-actions">
                {activeTab === "pantry" && (
                  <button className="btn-ghost" onClick={clearPantry} disabled={loading || clearingPantry || pantry.length === 0}>
                    {clearingPantry ? "🧹 Clearing…" : "🧹 Clear pantry"}
                  </button>
                )}
                <button className="btn-primary" onClick={generateMeals} disabled={loading || clearingPantry}>
                  {loading ? "⏳ Working…" : "✨ Generate Meals"}
                </button>
              </div>
            )}
          </div>

          {/* ── PANTRY & MEALS: summary + upload ── */}
          {activeTab !== "profile" && (
            <>
              <div className="summary-strip">
                <div className="summary-card"><div className="summary-value">{pantry.length}</div><div className="summary-label">Total Items</div></div>
                <div className="summary-card"><div className="summary-value" style={{ color: expiringCount > 0 ? "var(--terra)" : "inherit" }}>{expiringCount}</div><div className="summary-label">Expiring Soon</div></div>
                <div className="summary-card"><div className="summary-value">{meals ? (Array.isArray(meals?.meal_plan) ? meals.meal_plan.length : Object.keys(meals?.meal_plan?.day_1 || {}).length) : "—"}</div><div className="summary-label">Meal Ideas</div></div>
              </div>

              <div className={`upload-zone${dragOver ? " drag-over" : ""}`} onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={handleDrop}>
                <div className="upload-icon-wrap">📄</div>
                <p className="upload-title">Drop your grocery invoice here</p>
                <p className="upload-sub">or browse to upload a file from your device</p>
                <div className="upload-formats">
                  {["PDF","JPG","PNG","CSV"].map(f => <span key={f} className="format-tag">{f}</span>)}
                </div>
                <input type="file" onChange={handleUpload} id="upload" style={{display:'none'}} />
                <label htmlFor="upload" className="upload-btn-label">📂 Browse files</label>
                {loading && <div className="loading-bar" />}
                {uploadSuccess && <div className="upload-success-banner">✓ Pantry updated successfully!</div>}
                {uploadError && <div className="error-banner">⚠️ {uploadError}</div>}
              </div>

              <div className="tabs">
                <button className={`tab${activeTab === "pantry" ? " active" : ""}`} onClick={() => setActiveTab("pantry")}>📦 Pantry ({pantry.length})</button>
                <button className={`tab${activeTab === "meals"  ? " active" : ""}`} onClick={() => setActiveTab("meals")}>🍽️ Meal Suggestions</button>
              </div>
            </>
          )}

          {/* ── PANTRY TAB ── */}
          {activeTab === "pantry" && (
            <div className="pantry-grid">
              {pantry.length === 0 ? (
                <div className="empty-state"><div className="empty-icon">🛒</div><div className="empty-title">Your pantry is empty</div><div className="empty-sub">Upload a grocery invoice above to get started</div></div>
              ) : pantry.map((item, i) => {
                const cardClass = item.status?.includes("expiring") ? "expiring" : item.status?.includes("soon") ? "soon" : "fresh";
                return (
                  <div key={i} className={`pantry-card ${cardClass}`}>
                    <div className="card-top"><span className="item-name">{item.name}</span><span className="item-qty">×{item.qty}</span></div>
                    <div className="status-row"><span className="status-dot" /><span className="status-text">{item.status || "In stock"}</span></div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── MEALS TAB ── */}
          {activeTab === "meals" && (
            !meals ? (
              <div className="meals-empty">
                <div className="meals-empty-icon">🍳</div>
                <div className="meals-empty-title serif">Nothing cooked up yet</div>
                <div className="meals-empty-sub">Hit "Generate Meals" to get personalised recipe ideas from your pantry</div>
                {mealsError && <div className="error-banner" style={{ marginTop: 12 }}>⚠️ {mealsError}</div>}
                <button className="btn-primary" onClick={generateMeals} disabled={loading} style={{margin:'0 auto'}}>✨ Generate Meals</button>
              </div>
            ) : (
              <div className="meals-grid">
                {Array.isArray(meals?.meal_plan) && meals.meal_plan.map((meal: any, i: number) => <MealCard key={i} meal={meal} index={i} />)}
                {meals?.meal_plan?.day_1 && Object.entries(meals.meal_plan.day_1).map(([mealType, data]: any, i: number) => <MealCard key={mealType} meal={data} index={i} mealType={mealType} />)}
              </div>
            )
          )}

          {/* ── HEALTH PROFILE TAB ── */}
          {activeTab === "profile" && (
            <>
              {/* Stepper */}
              <div className="stepper">
                {HP_STEPS.map(s => (
                  <div key={s.id} className={`step-item${hpStep === s.id ? " active" : ""}${hpStep > s.id ? " done" : ""}`} onClick={() => hpStep > s.id && setHpStep(s.id)} style={{ cursor: hpStep > s.id ? "pointer" : "default" }}>
                    <div className="step-bubble">{hpStep > s.id ? "✓" : s.icon}</div>
                    <span className="step-label">{s.label}</span>
                  </div>
                ))}
              </div>

              <div className="form-card" key={hpStep}>

                {/* Step 1 — Basics */}
                {hpStep === 1 && <>
                  <div className="form-card-header"><div className="form-card-title">Tell us about yourself</div><div className="form-card-sub">We'll use this to personalise your nutrition targets</div></div>
                  <div className="form-card-body">
                    <div className="two-col">
                      <div className="field-group"><label className="field-label">Age</label><input className="input" type="number" min="10" max="120" placeholder="e.g. 28" value={profile.age} onChange={e => setP("age", e.target.value)} /></div>
                      <div className="field-group"><label className="field-label">Gender</label>
                        <div className="gender-row">{["Male","Female","Other"].map(g => <button key={g} type="button" className={`gender-btn${profile.gender === g ? " selected" : ""}`} onClick={() => setP("gender", g)}>{g}</button>)}</div>
                      </div>
                    </div>
                    <div className="two-col">
                      <div className="field-group"><label className="field-label">Weight</label><div className="input-row"><input className="input" type="number" placeholder="e.g. 70" value={profile.weight} onChange={e => setP("weight", e.target.value)} /><select className="unit-select" value={profile.weight_unit} onChange={e => setP("weight_unit", e.target.value)}><option value="kg">kg</option><option value="lbs">lbs</option></select></div></div>
                      <div className="field-group"><label className="field-label">Height</label><div className="input-row"><input className="input" type="number" placeholder="e.g. 175" value={profile.height} onChange={e => setP("height", e.target.value)} /><select className="unit-select" value={profile.height_unit} onChange={e => setP("height_unit", e.target.value)}><option value="cm">cm</option><option value="ft">ft</option></select></div></div>
                    </div>
                  </div>
                </>}

                {/* Step 2 — Goals */}
                {hpStep === 2 && <>
                  <div className="form-card-header"><div className="form-card-title">What's your goal?</div><div className="form-card-sub">Your meal plans will be optimised for this</div></div>
                  <div className="form-card-body">
                    <div className="field-group"><label className="field-label">Primary Goal</label>
                      <div className="goal-grid">{GOALS.map(g => <div key={g.value} className={`goal-card${profile.goal === g.value ? " selected" : ""}`} onClick={() => setP("goal", g.value)}><div className="goal-card-icon">{g.icon}</div><div className="goal-card-label">{g.label}</div></div>)}</div>
                    </div>
                    <div className="field-group"><label className="field-label">Activity Level</label>
                      <div className="activity-list">{ACTIVITY_LEVELS.map(a => <div key={a.value} className={`activity-card${profile.activity_level === a.value ? " selected" : ""}`} onClick={() => setP("activity_level", a.value)}><div><div className="activity-label">{a.label}</div><div className="activity-sub">{a.sub}</div></div><div className="activity-check">{profile.activity_level === a.value && <div className="check-dot" />}</div></div>)}</div>
                    </div>
                  </div>
                </>}

                {/* Step 3 — Diet */}
                {hpStep === 3 && <>
                  <div className="form-card-header"><div className="form-card-title">Your diet preferences</div><div className="form-card-sub">We'll filter meal suggestions to match</div></div>
                  <div className="form-card-body">
                    <div className="field-group"><label className="field-label">Diet Type</label><div className="diet-grid">{DIET_TYPES.map(d => <button key={d.value} type="button" className={`diet-pill${profile.diet_type === d.value ? " selected" : ""}`} onClick={() => setP("diet_type", d.value)}>{d.label}</button>)}</div></div>
                    <div className="field-group"><label className="field-label">Allergies</label><p className="field-hint">Select all that apply</p><div className="chips-grid">{ALLERGIES.map(a => <Chip key={a} selected={profile.allergies.includes(a)} onClick={() => toggleArr("allergies", a)}>{a}</Chip>)}</div></div>
                    <div className="field-group"><label className="field-label">Intolerances</label><p className="field-hint">Select all that apply</p><div className="chips-grid">{INTOLERANCES.map(i => <Chip key={i} selected={profile.intolerances.includes(i)} onClick={() => toggleArr("intolerances", i)}>{i}</Chip>)}</div></div>
                  </div>
                </>}

                {/* Step 4 — Health */}
                {hpStep === 4 && <>
                  <div className="form-card-header"><div className="form-card-title">Any health conditions?</div><div className="form-card-sub">Helps us suggest meals that are safe and beneficial for you</div></div>
                  <div className="form-card-body">
                    <div className="field-group"><label className="field-label">Conditions</label><p className="field-hint">Select all that apply — or skip if none</p><div className="chips-grid">{CONDITIONS.map(c => <Chip key={c} selected={profile.conditions.includes(c)} onClick={() => toggleArr("conditions", c)}>{c}</Chip>)}</div></div>
                  </div>
                </>}

                {/* Step 5 — Preferences */}
                {hpStep === 5 && <>
                  <div className="form-card-header"><div className="form-card-title">Final touches</div><div className="form-card-sub">Help us fine-tune your personalised meal plans</div></div>
                  <div className="form-card-body">
                    <div className="field-group"><label className="field-label">Meals per day</label>
                      <div className="meals-counter">
                        <button type="button" className="counter-btn" onClick={() => setP("meals_per_day", String(Math.max(1, parseInt(profile.meals_per_day) - 1)))}>−</button>
                        <span className="counter-value">{profile.meals_per_day}</span>
                        <button type="button" className="counter-btn" onClick={() => setP("meals_per_day", String(Math.min(6, parseInt(profile.meals_per_day) + 1)))}>+</button>
                        <span className="counter-label">meals / day</span>
                      </div>
                    </div>
                    <div className="field-group"><label className="field-label">Favourite cuisines</label><p className="field-hint">We'll prioritise these in suggestions</p><div className="chips-grid">{CUISINES.map(c => <Chip key={c} selected={profile.cuisine_preferences.includes(c)} onClick={() => toggleArr("cuisine_preferences", c)}>{c}</Chip>)}</div></div>
                    <div className="field-group"><label className="field-label">Ingredients to avoid</label><p className="field-hint">Optional — list anything you dislike</p><textarea className="input" placeholder="e.g. cilantro, bitter gourd, anchovies…" value={profile.disliked_ingredients} onChange={e => setP("disliked_ingredients", e.target.value)} /></div>
                    {profileSaved && <div className="save-banner">✓ Health profile saved! Your meal plans will now be personalised.</div>}
                    {profileError && <div className="error-banner">⚠️ {profileError}</div>}
                  </div>
                </>}

                {/* Footer */}
                <div className="form-footer">
                  <span className="step-counter">Step {hpStep} of {HP_STEPS.length}</span>
                  <div style={{ display: "flex", gap: "10px" }}>
                    {hpStep > 1 && <button type="button" className="btn-ghost" onClick={() => setHpStep(s => s - 1)}>← Back</button>}
                    {hpStep < HP_STEPS.length
                      ? <button type="button" className="btn-primary" onClick={() => setHpStep(s => s + 1)} disabled={!hpCanNext()}>Continue →</button>
                      : <button type="button" className="btn-primary" onClick={saveProfile} disabled={savingProfile}>{savingProfile ? "Saving…" : "💾 Save Profile"}</button>
                    }
                  </div>
                </div>

              </div>
            </>
          )}

        </main>
      </div>
    </>
  );
}