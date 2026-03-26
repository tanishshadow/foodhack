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
  goal: "", activity_level: "", diet_type: "none", allergies:[], intolerances:[],
  conditions:[], meals_per_day: "3", cuisine_preferences:[], disliked_ingredients: "",
};

// ── Option Lists ───────────────────────────────────────────────────────────
const GOALS =[
  { value: "lose_weight", label: "Lose Weight", icon: "📉" },
  { value: "maintain", label: "Maintain", icon: "⚖️" },
  { value: "gain_muscle", label: "Gain Muscle", icon: "💪" },
  { value: "eat_healthier", label: "Eat Healthier", icon: "🥗" },
  { value: "manage_condition", label: "Manage Condition", icon: "🩺" },
];
const ACTIVITY_LEVELS =[
  { value: "sedentary", label: "Sedentary", sub: "Little to no exercise" },
  { value: "light", label: "Lightly Active", sub: "1–3 days/week" },
  { value: "moderate", label: "Moderate", sub: "3–5 days/week" },
  { value: "active", label: "Very Active", sub: "6–7 days/week" },
  { value: "athlete", label: "Athlete", sub: "2× per day" },
];
const DIET_TYPES =[
  { value: "none", label: "No Restriction" }, { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" }, { value: "keto", label: "Keto" },
  { value: "paleo", label: "Paleo" }, { value: "mediterranean", label: "Mediterranean" },
  { value: "gluten_free", label: "Gluten-Free" }, { value: "dairy_free", label: "Dairy-Free" },
];
const ALLERGIES =["Nuts", "Peanuts", "Shellfish", "Fish", "Eggs", "Soy", "Wheat", "Sesame", "Milk"];
const INTOLERANCES =["Lactose", "Gluten", "Fructose", "Histamine", "FODMAPs"];
const CONDITIONS =["Diabetes", "Hypertension", "High Cholesterol", "IBS", "PCOS", "Thyroid", "Celiac", "Gout"];
const CUISINES =["Indian", "Mediterranean", "East Asian", "Mexican", "Italian", "Middle Eastern", "American", "Thai", "Japanese"];
const HP_STEPS =[
  { id: 1, label: "Basics" },
  { id: 2, label: "Goals" },
  { id: 3, label: "Diet" },
  { id: 4, label: "Health" },
  { id: 5, label: "Preferences" },
];

// ── Icons (Thickened for Blueprint styling) ────────────────────────────────
const Icons = {
  Upload: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  Package: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
  Utensils: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>,
  User: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Check: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Trash: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>,
  Sparkles: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M3 5h4"/><path d="M19 17v4"/><path d="M17 19h4"/></svg>,
  ChevronRight: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  ChevronLeft: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
  AlertCircle: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  BarChart: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>
};

// ── Main Component ─────────────────────────────────────────────────────────
export default function Home() {
  // Pantry & Meals state
  const [pantry, setPantry] = useState<any[]>([]);
  const[meals, setMeals] = useState<any>(null);
  const[clearingPantry, setClearingPantry] = useState(false);
  const[nutritionMap, setNutritionMap] = useState<Record<string, any>>({});
  const [loadingNutrition, setLoadingNutrition] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const[mealsError, setMealsError] = useState<string>("");
  const [uploadError, setUploadError] = useState<string>("");
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const[dragOver, setDragOver] = useState(false);

  // Tab state
  const[activeTab, setActiveTab] = useState<"pantry" | "meals" | "profile">("pantry");

  // Health Profile state
  const [profile, setProfile] = useState<HealthProfile>(EMPTY_PROFILE);
  const[hpStep, setHpStep] = useState(1);
  const[savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const[profileError, setProfileError] = useState("");

  useEffect(() => {
    // Load profile from localStorage first
    const saved = localStorage.getItem("healthProfile");
    if (saved) {
      try {
        setProfile(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved profile:", e);
      }
    }
    fetchPantry();
    fetchProfile();
  },[]);

  // ── Pantry & Meals ──────────────────────────────────────────────────────
  const fetchPantry = async () => {
    try {
      const res = await fetch(`${BASE_URL}/pantry/`);
      const data = await res.json();
      setPantry(data);
    } catch (err) {
      console.error("Failed to fetch pantry", err);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${BASE_URL}/health-profile`);
      if (!res.ok) return;
      const data = await res.json();
      if (data && (data.age || data.goal)) setProfile(data);
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
      const res = await fetch(`${BASE_URL}/meal/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
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
    setProfile(prev => ({ ...prev,[key]: value }));

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
    setSavingProfile(true); 
    setProfileError("");
    try {
      const res = await fetch(`${BASE_URL}/health-profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      
      // Save to localStorage as backup
      localStorage.setItem("healthProfile", JSON.stringify(profile));
      
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } catch (err: any) { 
      setProfileError(err.message || "Failed to save"); 
    }
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
      <div className="card meal-card">
        <div className="meal-card-content">
          <div className="meal-header">
            <span className="badge badge-accent">{mealType || `Suggestion ${index + 1}`}</span>
          </div>
          <h3 className="meal-title bp-bubbly">{name}</h3>
          {meal.description && <p className="meal-desc">{meal.description}</p>}
          
          <div className="meal-section-title">Ingredients</div>
          <div className="tag-group">
            {(meal.ingredients_used ||[]).map((ing: string, j: number) => (
              <span key={j} className="tag">{ing}</span>
            ))}
          </div>
        </div>
        
        <div className="meal-card-footer">
          <button className={`btn btn-outline ${nutrition ? 'active' : ''}`} onClick={() => toggleNutrition(name)} disabled={isLoadingNutri} style={{ width: '100%' }}>
            {isLoadingNutri ? <span className="spinner" /> : nutrition ? "Hide Nutrition" : "Nutrition Data"}
          </button>
          
          <div className={`nutrition-drawer ${nutrition ? "open" : ""}`}>
            {nutrition && (
              <div className="nutrition-grid">
                <div className="nutri-stat"><div className="nutri-val">{nutrition.calories}</div><div className="nutri-lbl">Kcal</div></div>
                <div className="nutri-stat"><div className="nutri-val">{nutrition.protein}g</div><div className="nutri-lbl">Protein</div></div>
                <div className="nutri-stat"><div className="nutri-val">{nutrition.carbs}g</div><div className="nutri-lbl">Carbs</div></div>
                <div className="nutri-stat"><div className="nutri-val">{nutrition.fat}g</div><div className="nutri-lbl">Fat</div></div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const Chip = ({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button type="button" onClick={onClick} className={`chip-btn ${selected ? "selected" : ""}`}>{children}</button>
  );

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700&family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap');
        
        :root {
          /* Blueprint 2024 inspired Palette */
          --bp-blue: #8DA3D3;      /* Header background */
          --bp-green: #A5BE8F;     /* Main background */
          --bp-dark: #2A1B38;      /* Deep purple/navy for strokes & text */
          --bp-white: #F4F6F0;     /* Cards background */
          --bp-accent: #B0A1D6;    /* Soft purple for primary buttons */
          --bp-accent-hover: #9888C0;
          --bp-red: #E08585;       /* Danger/Expiring */
          --bp-yellow: #E8D58B;    /* Warnings */
          
          --stroke-width: 3px;
          --hard-shadow: 4px 4px 0px var(--bp-dark);
          --hard-shadow-hover: 6px 6px 0px var(--bp-dark);
          --hard-shadow-active: 0px 0px 0px var(--bp-dark);
          
          --radius-md: 8px;
          --radius-lg: 16px;
          --radius-pill: 9999px;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        
        body { 
          font-family: 'Space Mono', monospace; 
          background: var(--bp-green); 
          color: var(--bp-dark); 
          -webkit-font-smoothing: antialiased; 
          line-height: 1.6;
        }

        .bp-bubbly { font-family: 'Fredoka', sans-serif; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }

        /* Layout Structure */
        .layout-wrapper { display: flex; flex-direction: column; min-height: 100vh; }
        
        /* Top Navbar (Blueprint Style) */
        .bp-navbar {
          display: flex; justify-content: space-between; align-items: center;
          background: var(--bp-blue); padding: 1.25rem 3rem;
          border-bottom: var(--stroke-width) solid var(--bp-dark);
          position: sticky; top: 0; z-index: 50;
        }
        .logo-wrap { display: flex; align-items: center; gap: 0.75rem; color: var(--bp-dark); text-decoration: none; cursor: pointer; }
        .logo-icon { width: 36px; height: 36px; border: var(--stroke-width) solid var(--bp-dark); background: var(--bp-green); border-radius: 8px; display: flex; align-items: center; justify-content: center; box-shadow: 2px 2px 0 var(--bp-dark); }
        .logo-text { font-size: 1.75rem; line-height: 1; }
        
        .nav-links { display: flex; align-items: center; gap: 2rem; }
        .nav-item {
          font-family: 'Space Mono', monospace; font-size: 1.1rem; font-weight: 700;
          color: var(--bp-dark); background: transparent; border: none; cursor: pointer;
          position: relative; transition: transform 0.2s;
        }
        .nav-item:hover { transform: translateY(-2px); }
        .nav-item.active { text-decoration: underline; text-underline-offset: 6px; text-decoration-thickness: 3px; }
        
        .nav-btn-apply {
          background: transparent; border: var(--stroke-width) solid var(--bp-dark);
          border-radius: var(--radius-md); padding: 0.5rem 1.5rem;
          font-family: 'Space Mono', monospace; font-weight: 700; font-size: 1.1rem; color: var(--bp-dark);
          cursor: pointer; box-shadow: var(--hard-shadow); transition: all 0.2s;
        }
        .nav-btn-apply:hover { background: rgba(255,255,255,0.2); transform: translate(-2px, -2px); box-shadow: var(--hard-shadow-hover); }
        .nav-btn-apply.active { background: var(--bp-accent); color: var(--bp-dark); }
        .nav-btn-apply:active { transform: translate(4px, 4px); box-shadow: var(--hard-shadow-active); }

        /* Main Content Area */
        .main-content { flex: 1; padding: 3rem 2rem 5rem; max-width: 1200px; margin: 0 auto; width: 100%; }

        /* Typography & Headers */
        .page-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 3rem; }
        .page-title { font-size: 4rem; color: var(--bp-dark); line-height: 1; text-shadow: 3px 3px 0 rgba(255,255,255,0.4); margin-bottom: 0.5rem; }
        .page-subtitle { font-size: 1.1rem; font-weight: 700; color: var(--bp-dark); max-width: 600px; }
        .header-actions { display: flex; gap: 1rem; }

        /* Buttons */
        .btn { 
          display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; 
          padding: 0.75rem 1.5rem; border-radius: var(--radius-md); 
          font-family: 'Space Mono', monospace; font-size: 1rem; font-weight: 700;
          cursor: pointer; transition: all 0.2s; 
          border: var(--stroke-width) solid var(--bp-dark); box-shadow: var(--hard-shadow);
        }
        .btn:disabled { opacity: 0.6; cursor: not-allowed; box-shadow: 2px 2px 0 var(--bp-dark) !important; transform: none !important; }
        
        .btn-primary { background: var(--bp-accent); color: var(--bp-dark); }
        .btn-primary:not(:disabled):hover { background: var(--bp-accent-hover); transform: translate(-2px, -2px); box-shadow: var(--hard-shadow-hover); }
        .btn-primary:not(:disabled):active { transform: translate(4px, 4px); box-shadow: var(--hard-shadow-active); }
        
        .btn-outline { background: var(--bp-white); color: var(--bp-dark); }
        .btn-outline:not(:disabled):hover { background: #E2E8DC; transform: translate(-2px, -2px); box-shadow: var(--hard-shadow-hover); }
        .btn-outline:not(:disabled):active { transform: translate(4px, 4px); box-shadow: var(--hard-shadow-active); }

        .spinner { 
          display: inline-block; width: 1.25rem; height: 1.25rem; 
          border: 3px solid var(--bp-dark); border-right-color: transparent; 
          border-radius: 50%; animation: spin 0.75s linear infinite; 
        }
        @keyframes spin { 100% { transform: rotate(360deg); } }

        /* Stats Strip */
        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-bottom: 3rem; }
        .stat-card { 
          background: var(--bp-white); padding: 1.5rem; border-radius: var(--radius-lg); 
          border: var(--stroke-width) solid var(--bp-dark); box-shadow: var(--hard-shadow);
          display: flex; flex-direction: column; gap: 0.5rem;
        }
        .stat-card-title { font-size: 1rem; font-weight: 700; text-transform: uppercase; border-bottom: 2px dashed var(--bp-dark); padding-bottom: 0.5rem; }
        .stat-card-value { font-size: 2.5rem; font-family: 'Fredoka', sans-serif; line-height: 1; color: var(--bp-dark); }

        /* Upload Zone */
        .upload-zone { 
          background: rgba(244, 246, 240, 0.6); border: 4px dashed var(--bp-dark); 
          border-radius: var(--radius-lg); padding: 3rem 2rem; text-align: center; 
          cursor: pointer; transition: all 0.2s; position: relative; overflow: hidden;
          margin-bottom: 3rem; display: flex; flex-direction: column; align-items: center; gap: 1rem;
        }
        .upload-zone:hover, .upload-zone.drag-over { background: rgba(244, 246, 240, 0.9); transform: scale(1.01); }
        .upload-icon { color: var(--bp-dark); background: var(--bp-accent); padding: 1rem; border-radius: var(--radius-md); border: var(--stroke-width) solid var(--bp-dark); box-shadow: var(--hard-shadow); margin-bottom: 0.5rem; }
        .upload-title { font-size: 1.5rem; font-weight: 700; color: var(--bp-dark); }
        .upload-subtitle { font-size: 1rem; font-weight: 400; }
        .loading-progress { position: absolute; bottom: 0; left: 0; height: 8px; background: var(--bp-dark); animation: progressAnim 1.5s infinite ease-in-out; border-top: var(--stroke-width) solid var(--bp-dark); }
        @keyframes progressAnim { 0% { width: 0%; left: 0; } 50% { width: 50%; left: 25%; } 100% { width: 0%; left: 100%; } }

        /* Banners / Alerts */
        .alert { display: flex; align-items: center; gap: 0.75rem; padding: 1rem 1.5rem; border-radius: var(--radius-md); font-weight: 700; margin-bottom: 2rem; border: var(--stroke-width) solid var(--bp-dark); box-shadow: var(--hard-shadow); animation: slideDown 0.3s ease; background: var(--bp-white); }
        .alert-success { background: #C1E1C1; }
        .alert-error { background: var(--bp-red); color: #fff; text-shadow: 1px 1px 0 #000; }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }

        /* Data Grids */
        .data-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 2rem; }
        .card { 
          background: var(--bp-white); border: var(--stroke-width) solid var(--bp-dark); 
          border-radius: var(--radius-lg); box-shadow: var(--hard-shadow); 
          transition: transform 0.2s, box-shadow 0.2s; overflow: hidden; display: flex; flex-direction: column; 
        }
        .card:hover { transform: translate(-2px, -2px); box-shadow: var(--hard-shadow-hover); }

        /* Pantry Card Specifics */
        .pantry-card { padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; justify-content: space-between; }
        .pantry-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; }
        .pantry-name { font-weight: 700; font-size: 1.25rem; line-height: 1.2; text-transform: uppercase; }
        .pantry-qty { background: var(--bp-accent); padding: 0.25rem 0.5rem; border-radius: var(--radius-md); font-weight: 700; border: 2px solid var(--bp-dark); box-shadow: 2px 2px 0 var(--bp-dark); }
        
        .badge { display: inline-flex; align-items: center; padding: 0.25rem 0.75rem; border-radius: var(--radius-pill); font-size: 0.85rem; font-weight: 700; text-transform: uppercase; border: 2px solid var(--bp-dark); }
        .badge-success { background: #C1E1C1; }
        .badge-warning { background: var(--bp-yellow); }
        .badge-danger { background: var(--bp-red); }
        .badge-accent { background: var(--bp-accent); }

        /* Meal Card Specifics */
        .meal-card-content { padding: 1.5rem; flex: 1; }
        .meal-header { margin-bottom: 1rem; }
        .meal-title { font-size: 1.5rem; margin-bottom: 0.75rem; line-height: 1.2; }
        .meal-desc { font-size: 0.95rem; margin-bottom: 1.5rem; line-height: 1.5; font-weight: 400; }
        .meal-section-title { font-size: 0.85rem; font-weight: 700; text-transform: uppercase; margin-bottom: 0.5rem; border-bottom: 2px dashed var(--bp-dark); padding-bottom: 0.25rem; display: inline-block; }
        
        .tag-group { display: flex; flex-wrap: wrap; gap: 0.5rem; }
        .tag { font-size: 0.8rem; font-weight: 700; background: transparent; padding: 0.25rem 0.5rem; border-radius: var(--radius-md); border: 2px solid var(--bp-dark); }
        
        .meal-card-footer { border-top: var(--stroke-width) solid var(--bp-dark); padding: 1.5rem; background: #E9EDDF; }
        
        .nutrition-drawer { max-height: 0; overflow: hidden; transition: max-height 0.3s ease, margin-top 0.3s ease; }
        .nutrition-drawer.open { max-height: 200px; margin-top: 1rem; }
        .nutrition-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; text-align: center; }
        .nutri-stat { background: var(--bp-white); border: 2px solid var(--bp-dark); padding: 0.75rem 0.25rem; border-radius: var(--radius-md); display: flex; flex-direction: column; gap: 0.25rem; box-shadow: 2px 2px 0 var(--bp-dark); }
        .nutri-val { font-size: 1.1rem; font-weight: 700; font-family: 'Fredoka', sans-serif; }
        .nutri-lbl { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; }

        /* Empty States */
        .empty-state { text-align: center; padding: 5rem 2rem; background: var(--bp-white); border: var(--stroke-width) solid var(--bp-dark); border-radius: var(--radius-lg); box-shadow: var(--hard-shadow); }
        .empty-icon { color: var(--bp-dark); margin-bottom: 1.5rem; display: inline-flex; transform: scale(1.5); }
        .empty-title { font-size: 2rem; color: var(--bp-dark); margin-bottom: 1rem; }
        .empty-subtitle { font-weight: 400; font-size: 1.1rem; max-width: 500px; margin: 0 auto 2rem; }

        /* Health Profile Stepper */
        .stepper-container { margin-bottom: 4rem; position: relative; }
        .stepper-track { position: absolute; top: 1.5rem; left: 10%; right: 10%; height: var(--stroke-width); background: var(--bp-dark); z-index: 0; }
        .stepper-progress { position: absolute; top: 1.5rem; left: 10%; height: var(--stroke-width); background: var(--bp-accent); z-index: 0; transition: width 0.3s ease; border-bottom: 2px solid var(--bp-dark); }
        .stepper-steps { display: flex; justify-content: space-between; position: relative; z-index: 1; }
        .step { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; width: 20%; cursor: pointer; }
        .step-circle { 
          width: 3rem; height: 3rem; border-radius: 50%; background: var(--bp-white); 
          border: var(--stroke-width) solid var(--bp-dark); display: flex; align-items: center; justify-content: center; 
          font-weight: 700; font-size: 1.2rem; font-family: 'Fredoka', sans-serif; transition: all 0.3s;
          box-shadow: 3px 3px 0 var(--bp-dark);
        }
        .step-label { font-size: 0.9rem; font-weight: 700; text-transform: uppercase; transition: color 0.3s; text-align: center; background: var(--bp-green); padding: 0 0.5rem; }
        
        .step.active .step-circle { background: var(--bp-yellow); transform: scale(1.1); box-shadow: 4px 4px 0 var(--bp-dark); }
        .step.completed .step-circle { background: var(--bp-accent); }

        /* Form Layout & Inputs */
        .form-card { background: var(--bp-white); border: var(--stroke-width) solid var(--bp-dark); border-radius: var(--radius-lg); box-shadow: 8px 8px 0 var(--bp-dark); overflow: hidden; animation: fadeIn 0.4s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        
        .form-header { padding: 2.5rem 3rem; border-bottom: var(--stroke-width) solid var(--bp-dark); background: var(--bp-blue); }
        .form-title { font-size: 2rem; color: var(--bp-dark); margin-bottom: 0.5rem; text-shadow: 2px 2px 0 rgba(255,255,255,0.4); }
        .form-subtitle { font-size: 1.1rem; font-weight: 700; }
        
        .form-body { padding: 3rem; display: flex; flex-direction: column; gap: 2.5rem; background: var(--bp-white); }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
        .form-group { display: flex; flex-direction: column; gap: 0.75rem; }
        .form-label { font-size: 1.1rem; font-weight: 700; text-transform: uppercase; }
        .form-hint { font-size: 0.85rem; font-weight: 400; margin-top: -0.5rem; opacity: 0.8; }
        
        .input-field { 
          width: 100%; padding: 1rem 1.25rem; border: var(--stroke-width) solid var(--bp-dark); 
          border-radius: var(--radius-md); font-family: 'Space Mono', monospace; font-size: 1.1rem; font-weight: 700;
          background: #fff; color: var(--bp-dark); transition: all 0.2s; box-shadow: inset 2px 2px 0 rgba(0,0,0,0.05);
        }
        .input-field:focus { outline: none; border-color: var(--bp-dark); box-shadow: 4px 4px 0 var(--bp-dark); transform: translate(-2px, -2px); }
        textarea.input-field { resize: vertical; min-height: 120px; }
        
        .input-group { display: flex; gap: 0.75rem; }
        .input-group .input-field { flex: 1; }
        .select-field { 
          padding: 1rem; border: var(--stroke-width) solid var(--bp-dark); border-radius: var(--radius-md); 
          background: var(--bp-accent); font-family: 'Space Mono', monospace; font-weight: 700; font-size: 1.1rem; cursor: pointer; outline: none; 
          box-shadow: 2px 2px 0 var(--bp-dark);
        }
        .select-field:focus { box-shadow: 4px 4px 0 var(--bp-dark); transform: translate(-2px, -2px); }

        /* Segmented Control & Chips */
        .segmented-control { display: flex; gap: 0.5rem; }
        .segment-btn { 
          flex: 1; text-align: center; padding: 1rem; border-radius: var(--radius-md); 
          font-size: 1rem; font-weight: 700; font-family: 'Space Mono', monospace;
          border: var(--stroke-width) solid var(--bp-dark); background: transparent; cursor: pointer; transition: all 0.2s; 
          box-shadow: 2px 2px 0 var(--bp-dark);
        }
        .segment-btn.active { background: var(--bp-dark); color: var(--bp-white); box-shadow: inset 2px 2px 0 rgba(0,0,0,0.5); transform: translate(2px, 2px); }

        .chip-grid { display: flex; flex-wrap: wrap; gap: 0.75rem; }
        .chip-btn { 
          padding: 0.6rem 1.25rem; border-radius: var(--radius-pill); border: var(--stroke-width) solid var(--bp-dark); 
          background: transparent; font-size: 1rem; font-weight: 700; color: var(--bp-dark); 
          cursor: pointer; transition: all 0.2s; font-family: 'Space Mono', monospace; box-shadow: 2px 2px 0 var(--bp-dark);
        }
        .chip-btn:hover { background: var(--bp-accent); transform: translate(-2px, -2px); box-shadow: 4px 4px 0 var(--bp-dark); }
        .chip-btn.selected { background: var(--bp-dark); color: var(--bp-white); box-shadow: none; transform: translate(2px, 2px); }

        /* Goal & Activity Cards */
        .selection-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 1.25rem; }
        .select-card { 
          border: var(--stroke-width) solid var(--bp-dark); border-radius: var(--radius-md); padding: 1.5rem 1rem; 
          text-align: center; cursor: pointer; transition: all 0.2s; background: var(--bp-white); box-shadow: 3px 3px 0 var(--bp-dark);
        }
        .select-card:hover { transform: translate(-2px, -2px); box-shadow: 5px 5px 0 var(--bp-dark); }
        .select-card.active { background: var(--bp-yellow); border-color: var(--bp-dark); box-shadow: inset 3px 3px 0 rgba(0,0,0,0.1); transform: translate(2px, 2px); }
        .select-card-icon { font-size: 2.5rem; margin-bottom: 1rem; display: block; }
        .select-card-label { font-size: 1.1rem; font-weight: 700; }
        
        .list-grid { display: grid; gap: 1rem; }
        .list-card { 
          display: flex; align-items: center; justify-content: space-between; padding: 1.25rem 1.5rem; 
          border: var(--stroke-width) solid var(--bp-dark); border-radius: var(--radius-md); cursor: pointer; 
          transition: all 0.2s; background: var(--bp-white); box-shadow: 3px 3px 0 var(--bp-dark);
        }
        .list-card:hover { transform: translate(-2px, -2px); box-shadow: 5px 5px 0 var(--bp-dark); }
        .list-card.active { background: var(--bp-accent); box-shadow: inset 3px 3px 0 rgba(0,0,0,0.1); transform: translate(2px, 2px); }
        .list-card-content .lbl { font-size: 1.1rem; font-weight: 700; margin-bottom: 0.25rem; }
        .list-card-content .sub { font-size: 0.9rem; font-weight: 400; }
        .radio-circle { width: 1.5rem; height: 1.5rem; border-radius: 50%; border: var(--stroke-width) solid var(--bp-dark); background: #fff; display: flex; align-items: center; justify-content: center; box-shadow: inset 2px 2px 0 rgba(0,0,0,0.1); }
        .list-card.active .radio-circle::after { content: ''; width: 0.75rem; height: 0.75rem; border-radius: 50%; background: var(--bp-dark); }

        /* Meals Counter Control */
        .counter-wrap { display: flex; align-items: center; gap: 1.5rem; background: var(--bp-white); padding: 0.75rem; border-radius: var(--radius-md); width: fit-content; border: var(--stroke-width) solid var(--bp-dark); box-shadow: 3px 3px 0 var(--bp-dark); }
        .counter-btn { width: 3rem; height: 3rem; border-radius: var(--radius-md); background: var(--bp-accent); border: var(--stroke-width) solid var(--bp-dark); display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 1.5rem; font-weight: 700; transition: 0.2s; box-shadow: 2px 2px 0 var(--bp-dark); }
        .counter-btn:hover { transform: translate(-2px, -2px); box-shadow: 4px 4px 0 var(--bp-dark); }
        .counter-btn:active { transform: translate(2px, 2px); box-shadow: inset 2px 2px 0 rgba(0,0,0,0.2); }
        .counter-val { font-size: 2rem; font-family: 'Fredoka', sans-serif; width: 2.5rem; text-align: center; }
        .counter-lbl { font-size: 1.1rem; font-weight: 700; padding-right: 0.5rem; text-transform: uppercase; }

        .form-footer { padding: 2.5rem 3rem; border-top: var(--stroke-width) solid var(--bp-dark); background: #E9EDDF; display: flex; justify-content: space-between; align-items: center; }
        .step-indicator { font-size: 1.1rem; font-weight: 700; text-transform: uppercase; border-bottom: 2px dashed var(--bp-dark); padding-bottom: 0.25rem; }

        /* Scrollbar */
        ::-webkit-scrollbar { width: 12px; }
        ::-webkit-scrollbar-track { background: var(--bp-green); border-left: var(--stroke-width) solid var(--bp-dark); }
        ::-webkit-scrollbar-thumb { background: var(--bp-blue); border: var(--stroke-width) solid var(--bp-dark); border-radius: 6px; }
        ::-webkit-scrollbar-thumb:hover { background: var(--bp-accent); }

        /* Responsive */
        @media (max-width: 768px) {
          .bp-navbar { flex-direction: column; gap: 1rem; padding: 1rem; }
          .nav-links { flex-wrap: wrap; justify-content: center; gap: 1rem; }
          .main-content { padding: 2rem 1rem; }
          .page-header { flex-direction: column; align-items: flex-start; gap: 1.5rem; }
          .page-title { font-size: 3rem; }
          .stats-grid { grid-template-columns: 1fr; }
          .form-row { grid-template-columns: 1fr; }
          .stepper-label { display: none; }
          .form-header, .form-body, .form-footer { padding: 1.5rem; }
          .form-footer { flex-direction: column-reverse; gap: 1.5rem; align-items: stretch; }
          .form-footer .btn { width: 100%; }
        }
      `}</style>

      <div className="layout-wrapper">
        
        {/* ── BP STYLE NAVBAR ── */}
        <nav className="bp-navbar">
          <div className="logo-wrap" onClick={() => setActiveTab("pantry")}>
            <div className="logo-icon"><Icons.Sparkles /></div>
            <span className="logo-text bp-bubbly">FOODHACK</span>
          </div>

          <div className="nav-links">
            <button className={`nav-item ${activeTab === "pantry" ? "active" : ""}`} onClick={() => setActiveTab("pantry")}>
              My Pantry
            </button>
            <button className={`nav-item ${activeTab === "meals" ? "active" : ""}`} onClick={() => setActiveTab("meals")}>
              Meal Plans
            </button>
            <button className={`nav-btn-apply ${activeTab === "profile" ? "active" : ""}`} onClick={() => setActiveTab("profile")}>
              Profile
            </button>
          </div>
        </nav>

        {/* ── MAIN CONTENT ── */}
        <main className="main-content">
          
          {/* Header */}
          <header className="page-header">
            <div>
              <h1 className="page-title bp-bubbly">
                {activeTab === "pantry" && "PANTRY"}
                {activeTab === "meals" && "MEALS"}
                {activeTab === "profile" && "PROFILE"}
              </h1>
              <p className="page-subtitle">
                {activeTab === "pantry" && "Track your ingredients and expiration dates."}
                {activeTab === "meals" && "AI-generated recipes based on your pantry."}
                {activeTab === "profile" && "Tailor recommendations to your dietary needs."}
              </p>
            </div>
            
            {activeTab !== "profile" && (
              <div className="header-actions">
                {activeTab === "pantry" && (
                  <button className="btn btn-outline" onClick={clearPantry} disabled={loading || clearingPantry || pantry.length === 0}>
                    {clearingPantry ? <><span className="spinner" /> CLEARING...</> : <><Icons.Trash /> CLEAR PANTRY</>}
                  </button>
                )}
                <button className="btn btn-primary" onClick={generateMeals} disabled={loading || clearingPantry}>
                  {loading ? <><span className="spinner"/> GENERATING...</> : <><Icons.Sparkles /> GENERATE MEALS</>}
                </button>
              </div>
            )}
          </header>

          {/* Pantry & Meals Shared Top Section */}
          {activeTab !== "profile" && (
            <>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-card-title">Total Items</div>
                  <div className="stat-card-value">{pantry.length}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-card-title">Expiring Soon</div>
                  <div className="stat-card-value" style={{ color: expiringCount > 0 ? "var(--bp-red)" : "inherit" }}>{expiringCount}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-card-title">Meal Ideas</div>
                  <div className="stat-card-value">{meals ? (Array.isArray(meals?.meal_plan) ? meals.meal_plan.length : Object.keys(meals?.meal_plan?.day_1 || {}).length) : "0"}</div>
                </div>
              </div>

              {activeTab === "pantry" && (
                <div 
                  className={`upload-zone ${dragOver ? "drag-over" : ""}`} 
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }} 
                  onDragLeave={() => setDragOver(false)} 
                  onDrop={handleDrop}
                >
                  <div className="upload-icon"><Icons.Upload /></div>
                  <div>
                    <h3 className="upload-title bp-bubbly">UPLOAD INVOICE</h3>
                    <p className="upload-subtitle">Drag & drop your grocery receipt (PDF, JPG, PNG, CSV)</p>
                  </div>
                  <input type="file" onChange={handleUpload} id="upload" style={{display:'none'}} />
                  <label htmlFor="upload" className="btn btn-primary" style={{ marginTop: '1rem' }}>BROWSE FILES</label>
                  
                  {loading && <div className="loading-progress" />}
                </div>
              )}

              {uploadSuccess && <div className="alert alert-success"><Icons.Check /> Pantry updated successfully!</div>}
              {uploadError && <div className="alert alert-error"><Icons.AlertCircle /> {uploadError}</div>}
            </>
          )}

          {/* ── PANTRY TAB CONTENT ── */}
          {activeTab === "pantry" && (
            <div className="data-grid">
              {pantry.length === 0 ? (
                <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                  <div className="empty-icon"><Icons.Package /></div>
                  <h3 className="empty-title bp-bubbly">PANTRY IS EMPTY</h3>
                  <p className="empty-subtitle">Upload a recent grocery receipt to populate your digital pantry.</p>
                </div>
              ) : pantry.map((item, i) => {
                const status = item.status?.toLowerCase() || "fresh";
                const isExpiring = status.includes("expiring");
                const isSoon = status.includes("soon");
                const badgeClass = isExpiring ? "badge-danger" : isSoon ? "badge-warning" : "badge-success";
                
                return (
                  <div key={i} className="card pantry-card">
                    <div className="pantry-top">
                      <span className="pantry-name">{item.name}</span>
                      <span className="pantry-qty">×{item.qty}</span>
                    </div>
                    <div>
                      <span className={`badge ${badgeClass}`}>
                        {item.status || "Fresh"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── MEALS TAB CONTENT ── */}
          {activeTab === "meals" && (
            <>
              {mealsError && <div className="alert alert-error"><Icons.AlertCircle /> {mealsError}</div>}
              {!meals ? (
                <div className="empty-state">
                  <div className="empty-icon"><Icons.Utensils /></div>
                  <h3 className="empty-title bp-bubbly">NO MEALS YET</h3>
                  <p className="empty-subtitle">Click generate to get hackathon-fueled recipe ideas based on your pantry.</p>
                  <button className="btn btn-primary" onClick={generateMeals} disabled={loading} style={{marginTop: '1rem'}}>
                    <Icons.Sparkles /> GENERATE NOW
                  </button>
                </div>
              ) : (
                <div className="data-grid">
                  {Array.isArray(meals?.meal_plan) && meals.meal_plan.map((meal: any, i: number) => <MealCard key={i} meal={meal} index={i} />)}
                  {meals?.meal_plan?.day_1 && Object.entries(meals.meal_plan.day_1).map(([mealType, data]: any, i: number) => <MealCard key={mealType} meal={data} index={i} mealType={mealType} />)}
                </div>
              )}
            </>
          )}

          {/* ── HEALTH PROFILE TAB CONTENT ── */}
          {activeTab === "profile" && (
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
              
              {/* Visual Stepper */}
              <div className="stepper-container">
                <div className="stepper-track" />
                <div className="stepper-progress" style={{ width: `${((hpStep - 1) / (HP_STEPS.length - 1)) * 80 + 10}%` }} />
                <div className="stepper-steps">
                  {HP_STEPS.map((s, idx) => {
                    const isActive = hpStep === s.id;
                    const isCompleted = hpStep > s.id;
                    return (
                      <div key={s.id} className={`step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`} onClick={() => isCompleted && setHpStep(s.id)}>
                        <div className="step-circle">{isCompleted ? <Icons.Check /> : s.id}</div>
                        <span className="step-label">{s.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="form-card" key={`step-${hpStep}`}>
                
                {/* Step 1: Basics */}
                {hpStep === 1 && (
                  <>
                    <div className="form-header">
                      <h2 className="form-title bp-bubbly">BASIC INFO</h2>
                      <p className="form-subtitle">The fundamentals for your nutrition algorithm.</p>
                    </div>
                    <div className="form-body">
                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">Age</label>
                          <input className="input-field" type="number" min="10" max="120" placeholder="e.g. 28" value={profile.age} onChange={e => setP("age", e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Gender</label>
                          <div className="segmented-control">
                            {["Male", "Female", "Other"].map(g => (
                              <button key={g} type="button" className={`segment-btn ${profile.gender === g ? "active" : ""}`} onClick={() => setP("gender", g)}>{g}</button>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">Weight</label>
                          <div className="input-group">
                            <input className="input-field" type="number" placeholder="e.g. 70" value={profile.weight} onChange={e => setP("weight", e.target.value)} />
                            <select className="select-field" value={profile.weight_unit} onChange={e => setP("weight_unit", e.target.value)}>
                              <option value="kg">KG</option>
                              <option value="lbs">LBS</option>
                            </select>
                          </div>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Height</label>
                          <div className="input-group">
                            <input className="input-field" type="number" placeholder="e.g. 175" value={profile.height} onChange={e => setP("height", e.target.value)} />
                            <select className="select-field" value={profile.height_unit} onChange={e => setP("height_unit", e.target.value)}>
                              <option value="cm">CM</option>
                              <option value="ft">FT</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Step 2: Goals */}
                {hpStep === 2 && (
                  <>
                    <div className="form-header">
                      <h2 className="form-title bp-bubbly">GOALS & ACTIVITY</h2>
                      <p className="form-subtitle">What's your primary objective?</p>
                    </div>
                    <div className="form-body">
                      <div className="form-group">
                        <label className="form-label">Primary Goal</label>
                        <div className="selection-grid">
                          {GOALS.map(g => (
                            <div key={g.value} className={`select-card ${profile.goal === g.value ? "active" : ""}`} onClick={() => setP("goal", g.value)}>
                              <span className="select-card-icon">{g.icon}</span>
                              <span className="select-card-label">{g.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="form-group" style={{ marginTop: '1.5rem' }}>
                        <label className="form-label">Activity Level</label>
                        <div className="list-grid">
                          {ACTIVITY_LEVELS.map(a => (
                            <div key={a.value} className={`list-card ${profile.activity_level === a.value ? "active" : ""}`} onClick={() => setP("activity_level", a.value)}>
                              <div className="list-card-content">
                                <div className="lbl">{a.label}</div>
                                <div className="sub">{a.sub}</div>
                              </div>
                              <div className="radio-circle" />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Step 3: Diet */}
                {hpStep === 3 && (
                  <>
                    <div className="form-header">
                      <h2 className="form-title bp-bubbly">DIETARY PREFS</h2>
                      <p className="form-subtitle">Any restrictions we should know about?</p>
                    </div>
                    <div className="form-body">
                      <div className="form-group">
                        <label className="form-label">Base Diet</label>
                        <div className="chip-grid">
                          {DIET_TYPES.map(d => (
                            <button key={d.value} type="button" className={`chip-btn ${profile.diet_type === d.value ? "selected" : ""}`} onClick={() => setP("diet_type", d.value)}>{d.label}</button>
                          ))}
                        </div>
                      </div>
                      <div className="form-group" style={{ marginTop: '1.5rem' }}>
                        <label className="form-label">Allergies</label>
                        <p className="form-hint">Select all that apply</p>
                        <div className="chip-grid">
                          {ALLERGIES.map(a => <Chip key={a} selected={profile.allergies.includes(a)} onClick={() => toggleArr("allergies", a)}>{a}</Chip>)}
                        </div>
                      </div>
                      <div className="form-group" style={{ marginTop: '1.5rem' }}>
                        <label className="form-label">Intolerances</label>
                        <p className="form-hint">Select all that apply</p>
                        <div className="chip-grid">
                          {INTOLERANCES.map(i => <Chip key={i} selected={profile.intolerances.includes(i)} onClick={() => toggleArr("intolerances", i)}>{i}</Chip>)}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Step 4: Health */}
                {hpStep === 4 && (
                  <>
                    <div className="form-header">
                      <h2 className="form-title bp-bubbly">MEDICAL CONDITIONS</h2>
                      <p className="form-subtitle">Help us ensure recommendations are safe.</p>
                    </div>
                    <div className="form-body">
                      <div className="form-group">
                        <label className="form-label">Conditions</label>
                        <p className="form-hint">Select all that apply, or skip</p>
                        <div className="chip-grid" style={{ marginTop: '1rem' }}>
                          {CONDITIONS.map(c => <Chip key={c} selected={profile.conditions.includes(c)} onClick={() => toggleArr("conditions", c)}>{c}</Chip>)}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Step 5: Preferences */}
                {hpStep === 5 && (
                  <>
                    <div className="form-header">
                      <h2 className="form-title bp-bubbly">FINAL TOUCHES</h2>
                      <p className="form-subtitle">Personalise your tastes and daily rhythm.</p>
                    </div>
                    <div className="form-body">
                      <div className="form-group">
                        <label className="form-label">Meals Per Day</label>
                        <div className="counter-wrap">
                          <button type="button" className="counter-btn" onClick={() => setP("meals_per_day", String(Math.max(1, parseInt(profile.meals_per_day) - 1)))}>−</button>
                          <span className="counter-val">{profile.meals_per_day}</span>
                          <button type="button" className="counter-btn" onClick={() => setP("meals_per_day", String(Math.min(6, parseInt(profile.meals_per_day) + 1)))}>+</button>
                          <span className="counter-lbl">meals / day</span>
                        </div>
                      </div>
                      <div className="form-group" style={{ marginTop: '1.5rem' }}>
                        <label className="form-label">Favourite Cuisines</label>
                        <p className="form-hint">Prioritise these styles in generations</p>
                        <div className="chip-grid">
                          {CUISINES.map(c => <Chip key={c} selected={profile.cuisine_preferences.includes(c)} onClick={() => toggleArr("cuisine_preferences", c)}>{c}</Chip>)}
                        </div>
                      </div>
                      <div className="form-group" style={{ marginTop: '1.5rem' }}>
                        <label className="form-label">Ingredients to Avoid</label>
                        <p className="form-hint">List anything you dislike (comma separated)</p>
                        <textarea className="input-field" placeholder="e.g. cilantro, bitter gourd, anchovies..." value={profile.disliked_ingredients} onChange={e => setP("disliked_ingredients", e.target.value)} />
                      </div>

                      {profileError && <div className="alert alert-error"><Icons.AlertCircle /> {profileError}</div>}
                      {profileSaved && <div className="alert alert-success"><Icons.Check /> HEALTH PROFILE SAVED!</div>}
                    </div>
                  </>
                )}

                {/* Form Footer Actions */}
                <div className="form-footer">
                  <div className="step-indicator">STEP {hpStep} / {HP_STEPS.length}</div>
                  <div style={{ display: "flex", gap: "1rem" }}>
                    {hpStep > 1 && (
                      <button type="button" className="btn btn-outline" onClick={() => setHpStep(s => s - 1)}>
                        <Icons.ChevronLeft /> BACK
                      </button>
                    )}
                    
                    {hpStep < HP_STEPS.length ? (
                      <button type="button" className="btn btn-primary" onClick={() => setHpStep(s => s + 1)} disabled={!hpCanNext()}>
                        CONTINUE <Icons.ChevronRight />
                      </button>
                    ) : (
                      <button type="button" className="btn btn-primary" onClick={saveProfile} disabled={savingProfile}>
                        {savingProfile ? <><span className="spinner"/> SAVING...</> : <><Icons.Check /> SAVE PROFILE</>}
                      </button>
                    )}
                  </div>
                </div>
              </div>

            </div>
          )}
          
        </main>
      </div>
    </>
  );
}