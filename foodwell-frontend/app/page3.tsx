code
Tsx
download
content_copy
expand_less
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
  goal: "", activity_level: "", diet_type: "none", allergies:[], intolerances: [],
  conditions: [], meals_per_day: "3", cuisine_preferences:[], disliked_ingredients: "",
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

// ── Icons (Inline SVGs for polished UI) ────────────────────────────────────
const Icons = {
  Upload: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  Package: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
  Utensils: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>,
  User: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Check: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Trash: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>,
  Sparkles: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M3 5h4"/><path d="M19 17v4"/><path d="M17 19h4"/></svg>,
  ChevronRight: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  ChevronLeft: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
  AlertCircle: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  BarChart: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>
};

// ── Main Component ─────────────────────────────────────────────────────────
export default function Home() {
  // Pantry & Meals state
  const [pantry, setPantry] = useState<any[]>([]);
  const [meals, setMeals] = useState<any>(null);
  const[clearingPantry, setClearingPantry] = useState(false);
  const[nutritionMap, setNutritionMap] = useState<Record<string, any>>({});
  const [loadingNutrition, setLoadingNutrition] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const[mealsError, setMealsError] = useState<string>("");
  const [uploadError, setUploadError] = useState<string>("");
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // Tab state
  const[activeTab, setActiveTab] = useState<"pantry" | "meals" | "profile">("pantry");

  // Health Profile state
  const [profile, setProfile] = useState<HealthProfile>(EMPTY_PROFILE);
  const [hpStep, setHpStep] = useState(1);
  const[savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState("");

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
    setSavingProfile(true); 
    setProfileError("");
    try {
      // Save to backend
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
            <span className="badge badge-primary">{mealType || `Suggestion ${index + 1}`}</span>
          </div>
          <h3 className="meal-title">{name}</h3>
          {meal.description && <p className="meal-desc">{meal.description}</p>}
          
          <div className="meal-section-title">Key Ingredients</div>
          <div className="tag-group">
            {(meal.ingredients_used ||[]).map((ing: string, j: number) => (
              <span key={j} className="tag">{ing}</span>
            ))}
          </div>
        </div>
        
        <div className="meal-card-footer">
          <button className={`btn btn-outline btn-sm ${nutrition ? 'active' : ''}`} onClick={() => toggleNutrition(name)} disabled={isLoadingNutri} style={{ width: '100%' }}>
            {isLoadingNutri ? <span className="spinner" /> : nutrition ? "Hide Nutrition" : <><Icons.BarChart /> Nutrition Data</>}
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
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        :root {
          /* Color Palette: Modern Minimalist with Indigo Accent */
          --bg-canvas: #F3F4F6;
          --bg-surface: #FFFFFF;
          --text-main: #111827;
          --text-muted: #6B7280;
          --border-light: #E5E7EB;
          --border-focus: #C7D2FE;
          
          --primary: #4F46E5;
          --primary-hover: #4338CA;
          --primary-light: #EEF2FF;
          --primary-text: #3730A3;

          --danger: #EF4444;
          --danger-bg: #FEF2F2;
          --danger-text: #991B1B;

          --warning: #F59E0B;
          --warning-bg: #FFFBEB;
          --warning-text: #92400E;

          --success: #10B981;
          --success-bg: #ECFDF5;
          --success-text: #065F46;

          /* Spacing & Radii */
          --radius-md: 0.5rem;
          --radius-lg: 0.75rem;
          --radius-xl: 1rem;
          --radius-2xl: 1.5rem;

          --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        
        body { 
          font-family: 'Inter', system-ui, sans-serif; 
          background: var(--bg-canvas); 
          color: var(--text-main); 
          -webkit-font-smoothing: antialiased; 
          line-height: 1.5;
        }

        /* Layout Structure */
        .layout-wrapper { display: flex; height: 100vh; overflow: hidden; }
        
        /* Sidebar */
        .sidebar { 
          width: 280px; 
          background: var(--bg-surface); 
          border-right: 1px solid var(--border-light); 
          display: flex; flex-direction: column; 
          flex-shrink: 0;
          z-index: 10;
        }
        .sidebar-header { padding: 1.5rem 1.5rem 2rem; }
        .logo-wrap { display: flex; align-items: center; gap: 0.75rem; }
        .logo-icon { width: 32px; height: 32px; background: var(--primary); color: white; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: bold; }
        .logo-text { font-size: 1.25rem; font-weight: 700; letter-spacing: -0.025em; color: var(--text-main); }
        
        .nav-menu { flex: 1; padding: 0 1rem; display: flex; flex-direction: column; gap: 0.25rem; }
        .nav-item { 
          display: flex; align-items: center; gap: 0.75rem; 
          padding: 0.75rem 1rem; border-radius: var(--radius-md); 
          font-size: 0.95rem; font-weight: 500; color: var(--text-muted); 
          border: none; background: transparent; cursor: pointer; text-align: left; 
          transition: all 0.2s; 
        }
        .nav-item:hover { background: var(--bg-canvas); color: var(--text-main); }
        .nav-item.active { background: var(--primary-light); color: var(--primary-text); }
        .nav-item.active svg { color: var(--primary); }

        .sidebar-footer { padding: 1.5rem; border-top: 1px solid var(--border-light); }
        .mini-stats { display: flex; flex-direction: column; gap: 0.75rem; }
        .mini-stat-row { display: flex; justify-content: space-between; align-items: center; font-size: 0.875rem; }
        .mini-stat-lbl { color: var(--text-muted); font-weight: 500; }
        .mini-stat-val { font-weight: 600; background: var(--bg-canvas); padding: 0.125rem 0.5rem; border-radius: 999px; }

        /* Main Content Area */
        .main-content { flex: 1; overflow-y: auto; position: relative; scroll-behavior: smooth; }
        .container { max-width: 1080px; margin: 0 auto; padding: 2.5rem 2rem 5rem; }

        /* Typography & Headers */
        .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2.5rem; }
        .page-title { font-size: 2rem; font-weight: 700; letter-spacing: -0.025em; color: var(--text-main); margin-bottom: 0.5rem; }
        .page-subtitle { font-size: 1rem; color: var(--text-muted); max-width: 600px; }
        .header-actions { display: flex; gap: 0.75rem; align-items: center; }

        /* Components: Buttons */
        .btn { 
          display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; 
          padding: 0.625rem 1.25rem; border-radius: var(--radius-md); 
          font-size: 0.9rem; font-weight: 600; font-family: inherit;
          cursor: pointer; transition: all 0.2s; border: 1px solid transparent; 
        }
        .btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .btn-primary { background: var(--primary); color: white; box-shadow: var(--shadow-sm); }
        .btn-primary:not(:disabled):hover { background: var(--primary-hover); }
        .btn-secondary { background: white; border-color: var(--border-light); color: var(--text-main); box-shadow: var(--shadow-sm); }
        .btn-secondary:not(:disabled):hover { background: var(--bg-canvas); }
        .btn-outline { background: transparent; border-color: var(--border-light); color: var(--text-muted); }
        .btn-outline:not(:disabled):hover { border-color: var(--border-focus); color: var(--primary); }
        .btn-outline.active { background: var(--primary-light); color: var(--primary); border-color: var(--primary-light); }
        .btn-sm { padding: 0.5rem 0.75rem; font-size: 0.85rem; }

        .spinner { 
          display: inline-block; width: 1.25rem; height: 1.25rem; 
          border: 2px solid currentColor; border-right-color: transparent; 
          border-radius: 50%; animation: spin 0.75s linear infinite; 
        }
        @keyframes spin { 100% { transform: rotate(360deg); } }

        /* Summary Stats Strip */
        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 2.5rem; }
        .stat-card { background: var(--bg-surface); padding: 1.25rem; border-radius: var(--radius-lg); border: 1px solid var(--border-light); box-shadow: var(--shadow-sm); display: flex; flex-direction: column; gap: 0.5rem; }
        .stat-card-title { font-size: 0.85rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
        .stat-card-value { font-size: 2rem; font-weight: 700; color: var(--text-main); line-height: 1; }
        .stat-card-value.danger { color: var(--danger); }

        /* Upload Zone */
        .upload-zone { 
          background: var(--bg-surface); border: 2px dashed var(--border-light); 
          border-radius: var(--radius-xl); padding: 3rem 2rem; text-align: center; 
          cursor: pointer; transition: all 0.2s; position: relative; overflow: hidden;
          margin-bottom: 2rem; display: flex; flex-direction: column; align-items: center; gap: 1rem;
        }
        .upload-zone:hover, .upload-zone.drag-over { border-color: var(--primary); background: var(--primary-light); }
        .upload-icon { color: var(--primary); background: white; padding: 1rem; border-radius: 50%; box-shadow: var(--shadow-sm); margin-bottom: 0.5rem; }
        .upload-title { font-size: 1.1rem; font-weight: 600; color: var(--text-main); }
        .upload-subtitle { font-size: 0.9rem; color: var(--text-muted); }
        .loading-progress { position: absolute; bottom: 0; left: 0; height: 4px; background: var(--primary); animation: progressAnim 1.5s infinite ease-in-out; }
        @keyframes progressAnim { 0% { width: 0%; left: 0; } 50% { width: 50%; left: 25%; } 100% { width: 0%; left: 100%; } }

        /* Tabs */
        .tabs-wrap { margin-bottom: 1.5rem; border-bottom: 1px solid var(--border-light); display: flex; gap: 2rem; }
        .tab-btn { 
          padding: 0.75rem 0; font-size: 0.95rem; font-weight: 500; color: var(--text-muted); 
          background: transparent; border: none; cursor: pointer; position: relative; transition: color 0.2s; 
        }
        .tab-btn:hover { color: var(--text-main); }
        .tab-btn.active { color: var(--primary); font-weight: 600; }
        .tab-btn.active::after { content: ''; position: absolute; bottom: -1px; left: 0; right: 0; height: 2px; background: var(--primary); border-radius: 2px 2px 0 0; }

        /* Banners / Alerts */
        .alert { display: flex; align-items: center; gap: 0.75rem; padding: 1rem; border-radius: var(--radius-md); font-size: 0.9rem; font-weight: 500; margin-bottom: 1.5rem; animation: slideDown 0.3s ease; }
        .alert-success { background: var(--success-bg); color: var(--success-text); border: 1px solid #A7F3D0; }
        .alert-error { background: var(--danger-bg); color: var(--danger-text); border: 1px solid #FECACA; }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }

        /* Data Grids */
        .data-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1.25rem; }
        .card { background: var(--bg-surface); border: 1px solid var(--border-light); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); transition: transform 0.2s, box-shadow 0.2s; overflow: hidden; display: flex; flex-direction: column; }
        .card:hover { box-shadow: var(--shadow-md); transform: translateY(-2px); }

        /* Pantry Card Specifics */
        .pantry-card { padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem; justify-content: space-between; }
        .pantry-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; }
        .pantry-name { font-weight: 600; font-size: 1rem; line-height: 1.3; color: var(--text-main); }
        .pantry-qty { background: var(--bg-canvas); padding: 0.25rem 0.6rem; border-radius: var(--radius-md); font-size: 0.85rem; font-weight: 600; color: var(--text-muted); }
        
        .badge { display: inline-flex; align-items: center; padding: 0.25rem 0.6rem; border-radius: 999px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
        .badge-success { background: var(--success-bg); color: var(--success-text); }
        .badge-warning { background: var(--warning-bg); color: var(--warning-text); }
        .badge-danger { background: var(--danger-bg); color: var(--danger-text); }
        .badge-primary { background: var(--primary-light); color: var(--primary-text); }

        /* Meal Card Specifics */
        .meal-card-content { padding: 1.5rem 1.5rem 1rem; flex: 1; }
        .meal-header { margin-bottom: 0.75rem; }
        .meal-title { font-size: 1.25rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.5rem; line-height: 1.3; }
        .meal-desc { font-size: 0.9rem; color: var(--text-muted); margin-bottom: 1.25rem; line-height: 1.5; }
        .meal-section-title { font-size: 0.75rem; font-weight: 600; text-transform: uppercase; color: var(--text-muted); margin-bottom: 0.5rem; letter-spacing: 0.05em; }
        
        .tag-group { display: flex; flex-wrap: wrap; gap: 0.4rem; }
        .tag { font-size: 0.75rem; font-weight: 500; background: var(--bg-canvas); color: var(--text-main); padding: 0.25rem 0.6rem; border-radius: var(--radius-sm); border: 1px solid var(--border-light); }
        
        .meal-card-footer { border-top: 1px solid var(--border-light); padding: 1rem 1.5rem; background: #FAFAFA; }
        
        .nutrition-drawer { max-height: 0; overflow: hidden; transition: max-height 0.3s ease, margin-top 0.3s ease; }
        .nutrition-drawer.open { max-height: 150px; margin-top: 1rem; }
        .nutrition-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; text-align: center; }
        .nutri-stat { background: white; border: 1px solid var(--border-light); padding: 0.75rem 0.25rem; border-radius: var(--radius-md); display: flex; flex-direction: column; gap: 0.25rem; }
        .nutri-val { font-size: 0.95rem; font-weight: 700; color: var(--text-main); }
        .nutri-lbl { font-size: 0.65rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }

        /* Empty States */
        .empty-state { text-align: center; padding: 4rem 2rem; background: var(--bg-surface); border: 1px dashed var(--border-light); border-radius: var(--radius-lg); }
        .empty-icon { color: var(--border-light); margin-bottom: 1rem; display: inline-flex; }
        .empty-icon svg { width: 64px; height: 64px; }
        .empty-title { font-size: 1.25rem; font-weight: 600; color: var(--text-main); margin-bottom: 0.5rem; }
        .empty-subtitle { color: var(--text-muted); max-width: 400px; margin: 0 auto 1.5rem; }

        /* Health Profile Stepper */
        .stepper-container { margin-bottom: 3rem; position: relative; }
        .stepper-track { position: absolute; top: 1.25rem; left: 10%; right: 10%; height: 2px; background: var(--border-light); z-index: 0; }
        .stepper-progress { position: absolute; top: 1.25rem; left: 10%; height: 2px; background: var(--primary); z-index: 0; transition: width 0.3s ease; }
        .stepper-steps { display: flex; justify-content: space-between; position: relative; z-index: 1; }
        .step { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; width: 20%; cursor: pointer; }
        .step-circle { 
          width: 2.5rem; height: 2.5rem; border-radius: 50%; background: var(--bg-surface); 
          border: 2px solid var(--border-light); display: flex; align-items: center; justify-content: center; 
          font-weight: 600; font-size: 0.9rem; color: var(--text-muted); transition: all 0.3s;
        }
        .step-label { font-size: 0.85rem; font-weight: 500; color: var(--text-muted); transition: color 0.3s; text-align: center; }
        
        .step.active .step-circle { border-color: var(--primary); color: var(--primary); box-shadow: 0 0 0 4px var(--primary-light); }
        .step.active .step-label { color: var(--primary); font-weight: 600; }
        .step.completed .step-circle { background: var(--primary); border-color: var(--primary); color: white; }
        .step.completed .step-label { color: var(--text-main); }

        /* Form Layout & Inputs */
        .form-card { background: var(--bg-surface); border: 1px solid var(--border-light); border-radius: var(--radius-xl); box-shadow: var(--shadow-sm); overflow: hidden; animation: fadeIn 0.4s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        
        .form-header { padding: 2rem 2.5rem; border-bottom: 1px solid var(--border-light); background: #FAFAFA; }
        .form-title { font-size: 1.5rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.25rem; }
        .form-subtitle { font-size: 0.95rem; color: var(--text-muted); }
        
        .form-body { padding: 2.5rem; display: flex; flex-direction: column; gap: 2rem; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
        .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .form-label { font-size: 0.9rem; font-weight: 600; color: var(--text-main); }
        .form-hint { font-size: 0.8rem; color: var(--text-muted); margin-top: -0.25rem; }
        
        .input-field { 
          width: 100%; padding: 0.75rem 1rem; border: 1px solid var(--border-light); 
          border-radius: var(--radius-md); font-family: inherit; font-size: 0.95rem; 
          background: var(--bg-surface); color: var(--text-main); transition: all 0.2s; 
        }
        .input-field:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-light); }
        .input-field::placeholder { color: #9CA3AF; }
        textarea.input-field { resize: vertical; min-height: 100px; }
        
        .input-group { display: flex; gap: 0.5rem; }
        .input-group .input-field { flex: 1; }
        .select-field { 
          padding: 0.75rem; border: 1px solid var(--border-light); border-radius: var(--radius-md); 
          background: var(--bg-canvas); font-family: inherit; font-weight: 500; font-size: 0.9rem; cursor: pointer; outline: none; 
        }
        .select-field:focus { border-color: var(--primary); }

        /* Segmented Control & Chips */
        .segmented-control { display: flex; background: var(--bg-canvas); padding: 0.25rem; border-radius: var(--radius-md); }
        .segment-btn { 
          flex: 1; text-align: center; padding: 0.625rem; border-radius: calc(var(--radius-md) - 2px); 
          font-size: 0.9rem; font-weight: 500; color: var(--text-muted); cursor: pointer; 
          border: none; background: transparent; transition: all 0.2s; 
        }
        .segment-btn.active { background: var(--bg-surface); color: var(--text-main); box-shadow: var(--shadow-sm); }

        .chip-grid { display: flex; flex-wrap: wrap; gap: 0.6rem; }
        .chip-btn { 
          padding: 0.5rem 1rem; border-radius: 999px; border: 1px solid var(--border-light); 
          background: var(--bg-surface); font-size: 0.9rem; font-weight: 500; color: var(--text-muted); 
          cursor: pointer; transition: all 0.2s; font-family: inherit;
        }
        .chip-btn:hover { border-color: var(--border-focus); color: var(--text-main); }
        .chip-btn.selected { background: var(--primary); border-color: var(--primary); color: white; }

        /* Goal & Activity Cards */
        .selection-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 1rem; }
        .select-card { 
          border: 1px solid var(--border-light); border-radius: var(--radius-lg); padding: 1.25rem 1rem; 
          text-align: center; cursor: pointer; transition: all 0.2s; background: var(--bg-surface);
        }
        .select-card:hover { border-color: var(--border-focus); }
        .select-card.active { border-color: var(--primary); background: var(--primary-light); box-shadow: 0 0 0 1px var(--primary); }
        .select-card-icon { font-size: 1.75rem; margin-bottom: 0.75rem; display: block; }
        .select-card-label { font-size: 0.9rem; font-weight: 600; color: var(--text-main); }
        
        .list-grid { display: grid; gap: 0.75rem; }
        .list-card { 
          display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.25rem; 
          border: 1px solid var(--border-light); border-radius: var(--radius-md); cursor: pointer; 
          transition: all 0.2s; background: var(--bg-surface);
        }
        .list-card:hover { border-color: var(--border-focus); }
        .list-card.active { border-color: var(--primary); background: var(--primary-light); }
        .list-card-content .lbl { font-size: 0.95rem; font-weight: 600; color: var(--text-main); margin-bottom: 0.1rem; }
        .list-card-content .sub { font-size: 0.8rem; color: var(--text-muted); }
        .radio-circle { width: 1.25rem; height: 1.25rem; border-radius: 50%; border: 2px solid var(--border-light); display: flex; align-items: center; justify-content: center; }
        .list-card.active .radio-circle { border-color: var(--primary); }
        .list-card.active .radio-circle::after { content: ''; width: 0.6rem; height: 0.6rem; border-radius: 50%; background: var(--primary); }

        /* Meals Counter Control */
        .counter-wrap { display: flex; align-items: center; gap: 1.25rem; background: var(--bg-canvas); padding: 0.5rem; border-radius: var(--radius-lg); width: fit-content; border: 1px solid var(--border-light); }
        .counter-btn { width: 2.5rem; height: 2.5rem; border-radius: var(--radius-md); background: var(--bg-surface); border: 1px solid var(--border-light); display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 1.25rem; color: var(--text-main); transition: 0.2s; box-shadow: var(--shadow-sm); }
        .counter-btn:hover { border-color: var(--primary); color: var(--primary); }
        .counter-val { font-size: 1.5rem; font-weight: 700; width: 2rem; text-align: center; }
        .counter-lbl { font-size: 0.9rem; font-weight: 500; color: var(--text-muted); padding-right: 0.5rem; }

        .form-footer { padding: 1.5rem 2.5rem; border-top: 1px solid var(--border-light); background: #FAFAFA; display: flex; justify-content: space-between; align-items: center; }
        .step-indicator { font-size: 0.9rem; font-weight: 600; color: var(--text-muted); }

        /* Scrollbar */
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #D1D5DB; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #9CA3AF; }

        /* Responsive */
        @media (max-width: 768px) {
          .layout-wrapper { flex-direction: column; }
          .sidebar { width: 100%; height: auto; border-right: none; border-bottom: 1px solid var(--border-light); flex-direction: row; align-items: center; justify-content: space-between; padding: 1rem; }
          .sidebar-header { padding: 0; }
          .nav-menu { display: none; } /* Could be a dropdown on mobile */
          .sidebar-footer { display: none; }
          
          .container { padding: 1.5rem 1rem; }
          .stats-grid { grid-template-columns: 1fr; }
          .form-row { grid-template-columns: 1fr; }
          .stepper-label { display: none; }
          .form-header { padding: 1.5rem; }
          .form-body { padding: 1.5rem; }
          .form-footer { padding: 1.5rem; flex-direction: column-reverse; gap: 1rem; }
          .form-footer .btn { width: 100%; }
        }
      `}</style>

      <div className="layout-wrapper">
        
        {/* ── SIDEBAR ── */}
        <aside className="sidebar">
          <div className="sidebar-header">
            <div className="logo-wrap">
              <div className="logo-icon"><Icons.Sparkles /></div>
              <span className="logo-text">FoodHack</span>
            </div>
          </div>

          <nav className="nav-menu">
            <button className={`nav-item ${activeTab === "pantry" ? "active" : ""}`} onClick={() => setActiveTab("pantry")}>
              <Icons.Package /> My Pantry
            </button>
            <button className={`nav-item ${activeTab === "meals" ? "active" : ""}`} onClick={() => setActiveTab("meals")}>
              <Icons.Utensils /> Meal Plans
            </button>
            <button className={`nav-item ${activeTab === "profile" ? "active" : ""}`} onClick={() => setActiveTab("profile")}>
              <Icons.User /> Health Profile
            </button>
          </nav>

          <div className="sidebar-footer">
            <div className="mini-stats">
              <div className="mini-stat-row">
                <span className="mini-stat-lbl">Tracked Items</span>
                <span className="mini-stat-val">{pantry.length}</span>
              </div>
              <div className="mini-stat-row">
                <span className="mini-stat-lbl">Expiring Soon</span>
                <span className="mini-stat-val" style={{ color: expiringCount > 0 ? "var(--danger)" : "inherit" }}>{expiringCount}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="main-content">
          <div className="container">
            
            {/* Header */}
            <header className="page-header">
              <div>
                <h1 className="page-title">
                  {activeTab === "pantry" && "Your Pantry Overview"}
                  {activeTab === "meals" && "Personalised Meal Plans"}
                  {activeTab === "profile" && "Your Health Profile"}
                </h1>
                <p className="page-subtitle">
                  {activeTab === "pantry" && "Manage your ingredients and keep track of what's expiring soon."}
                  {activeTab === "meals" && "AI-generated recipes based on your available ingredients and health goals."}
                  {activeTab === "profile" && "Help us tailor our recommendations to your unique lifestyle and dietary needs."}
                </p>
              </div>
              
              {activeTab !== "profile" && (
                <div className="header-actions">
                  {activeTab === "pantry" && (
                    <button className="btn btn-outline" onClick={clearPantry} disabled={loading || clearingPantry || pantry.length === 0}>
                      {clearingPantry ? <><span className="spinner" /> Clearing...</> : <><Icons.Trash /> Clear Pantry</>}
                    </button>
                  )}
                  <button className="btn btn-primary" onClick={generateMeals} disabled={loading || clearingPantry}>
                    {loading ? <><span className="spinner"/> Generating...</> : <><Icons.Sparkles /> Generate Meals</>}
                  </button>
                </div>
              )}
            </header>

            {/* Pantry & Meals Shared Top Section */}
            {activeTab !== "profile" && (
              <>
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-card-title">Total Ingredients</div>
                    <div className="stat-card-value">{pantry.length}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-card-title">Action Needed</div>
                    <div className={`stat-card-value ${expiringCount > 0 ? 'danger' : ''}`}>{expiringCount}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-card-title">Meal Suggestions</div>
                    <div className="stat-card-value">{meals ? (Array.isArray(meals?.meal_plan) ? meals.meal_plan.length : Object.keys(meals?.meal_plan?.day_1 || {}).length) : "0"}</div>
                  </div>
                </div>

                <div 
                  className={`upload-zone ${dragOver ? "drag-over" : ""}`} 
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }} 
                  onDragLeave={() => setDragOver(false)} 
                  onDrop={handleDrop}
                >
                  <div className="upload-icon"><Icons.Upload /></div>
                  <div>
                    <h3 className="upload-title">Upload Grocery Invoice</h3>
                    <p className="upload-subtitle">Drag and drop your receipt or invoice (PDF, JPG, PNG, CSV)</p>
                  </div>
                  <input type="file" onChange={handleUpload} id="upload" style={{display:'none'}} />
                  <label htmlFor="upload" className="btn btn-secondary" style={{ marginTop: '0.5rem' }}>Browse Files</label>
                  
                  {loading && <div className="loading-progress" />}
                </div>

                {uploadSuccess && <div className="alert alert-success"><Icons.Check /> Pantry updated successfully based on your invoice!</div>}
                {uploadError && <div className="alert alert-error"><Icons.AlertCircle /> {uploadError}</div>}

                <div className="tabs-wrap">
                  <button className={`tab-btn ${activeTab === "pantry" ? "active" : ""}`} onClick={() => setActiveTab("pantry")}>Pantry Items ({pantry.length})</button>
                  <button className={`tab-btn ${activeTab === "meals" ? "active" : ""}`} onClick={() => setActiveTab("meals")}>Generated Meals</button>
                </div>
              </>
            )}

            {/* ── PANTRY TAB CONTENT ── */}
            {activeTab === "pantry" && (
              <div className="data-grid">
                {pantry.length === 0 ? (
                  <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                    <div className="empty-icon"><Icons.Package /></div>
                    <h3 className="empty-title">Your pantry is empty</h3>
                    <p className="empty-subtitle">Upload a recent grocery receipt or invoice above to instantly populate your smart pantry.</p>
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
                    <h3 className="empty-title">No meal plans generated yet</h3>
                    <p className="empty-subtitle">Click the "Generate Meals" button at the top right to get AI-powered recipes tailored to your pantry.</p>
                    <button className="btn btn-primary" onClick={generateMeals} disabled={loading} style={{marginTop: '1rem'}}>
                      <Icons.Sparkles /> Generate Meals Now
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
              <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                
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
                        <h2 className="form-title">Basic Information</h2>
                        <p className="form-subtitle">Let's start with the fundamentals to calculate your nutritional needs.</p>
                      </div>
                      <div className="form-body">
                        <div className="form-row">
                          <div className="form-group">
                            <label className="form-label">Age</label>
                            <input className="input-field" type="number" min="10" max="120" placeholder="e.g. 28" value={profile.age} onChange={e => setP("age", e.target.value)} />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Biological Gender</label>
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
                                <option value="kg">kg</option>
                                <option value="lbs">lbs</option>
                              </select>
                            </div>
                          </div>
                          <div className="form-group">
                            <label className="form-label">Height</label>
                            <div className="input-group">
                              <input className="input-field" type="number" placeholder="e.g. 175" value={profile.height} onChange={e => setP("height", e.target.value)} />
                              <select className="select-field" value={profile.height_unit} onChange={e => setP("height_unit", e.target.value)}>
                                <option value="cm">cm</option>
                                <option value="ft">ft</option>
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
                        <h2 className="form-title">Goals & Activity</h2>
                        <p className="form-subtitle">What are you looking to achieve with your meal plans?</p>
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
                        <div className="form-group" style={{ marginTop: '1rem' }}>
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
                        <h2 className="form-title">Dietary Preferences</h2>
                        <p className="form-subtitle">Tell us what you can and cannot eat.</p>
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
                        <div className="form-group" style={{ marginTop: '1rem' }}>
                          <label className="form-label">Allergies</label>
                          <p className="form-hint">Select all that apply</p>
                          <div className="chip-grid">
                            {ALLERGIES.map(a => <Chip key={a} selected={profile.allergies.includes(a)} onClick={() => toggleArr("allergies", a)}>{a}</Chip>)}
                          </div>
                        </div>
                        <div className="form-group" style={{ marginTop: '1rem' }}>
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
                        <h2 className="form-title">Medical Conditions</h2>
                        <p className="form-subtitle">Optional. We'll ensure recommendations are safe for these conditions.</p>
                      </div>
                      <div className="form-body">
                        <div className="form-group">
                          <label className="form-label">Conditions</label>
                          <p className="form-hint">Select all that apply, or skip if none</p>
                          <div className="chip-grid" style={{ marginTop: '0.5rem' }}>
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
                        <h2 className="form-title">Final Touches</h2>
                        <p className="form-subtitle">Personalise your daily meal rhythm and tastes.</p>
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
                        <div className="form-group" style={{ marginTop: '1rem' }}>
                          <label className="form-label">Favourite Cuisines</label>
                          <p className="form-hint">We'll prioritise these styles when generating meals</p>
                          <div className="chip-grid">
                            {CUISINES.map(c => <Chip key={c} selected={profile.cuisine_preferences.includes(c)} onClick={() => toggleArr("cuisine_preferences", c)}>{c}</Chip>)}
                          </div>
                        </div>
                        <div className="form-group" style={{ marginTop: '1rem' }}>
                          <label className="form-label">Ingredients to Avoid</label>
                          <p className="form-hint">List anything you dislike (comma separated)</p>
                          <textarea className="input-field" placeholder="e.g. cilantro, bitter gourd, anchovies..." value={profile.disliked_ingredients} onChange={e => setP("disliked_ingredients", e.target.value)} />
                        </div>

                        {profileError && <div className="alert alert-error"><Icons.AlertCircle /> {profileError}</div>}
                        {profileSaved && <div className="alert alert-success"><Icons.Check /> Health profile saved successfully!</div>}
                      </div>
                    </>
                  )}

                  {/* Form Footer Actions */}
                  <div className="form-footer">
                    <div className="step-indicator">Step {hpStep} of {HP_STEPS.length}</div>
                    <div style={{ display: "flex", gap: "0.75rem" }}>
                      {hpStep > 1 && (
                        <button type="button" className="btn btn-secondary" onClick={() => setHpStep(s => s - 1)}>
                          <Icons.ChevronLeft /> Back
                        </button>
                      )}
                      
                      {hpStep < HP_STEPS.length ? (
                        <button type="button" className="btn btn-primary" onClick={() => setHpStep(s => s + 1)} disabled={!hpCanNext()}>
                          Continue <Icons.ChevronRight />
                        </button>
                      ) : (
                        <button type="button" className="btn btn-primary" onClick={saveProfile} disabled={savingProfile}>
                          {savingProfile ? <><span className="spinner"/> Saving...</> : <><Icons.Check /> Save Profile</>}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            )}
            
          </div>
        </main>
      </div>
    </>
  );
}