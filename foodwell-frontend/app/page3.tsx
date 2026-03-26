"use client";

import { useState, useEffect } from "react";

const BASE_URL = "http://localhost:8000";

export default function Home() {
  const [pantry, setPantry] = useState<any[]>([]);
  const [meals, setMeals] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<"pantry" | "meals">("pantry");
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    fetchPantry();
  }, []);

  const fetchPantry = async () => {
    const res = await fetch(`${BASE_URL}/pantry/`);
    const data = await res.json();
    setPantry(data);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const processFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    setLoading(true);
    setUploadSuccess(false);
    await fetch(`${BASE_URL}/invoice/upload`, { method: "POST", body: formData });
    await fetchPantry();
    setLoading(false);
    setUploadSuccess(true);
    setTimeout(() => setUploadSuccess(false), 3000);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const generateMeals = async () => {
    setLoading(true);
    const res = await fetch(`${BASE_URL}/meals/generate`);
    const data = await res.json();
    console.log(data);
    setMeals(data);
    setLoading(false);
    setActiveTab("meals");
  };

  const expiringCount = pantry.filter(i => i.status?.includes("expiring")).length;
  const soonCount = pantry.filter(i => i.status?.includes("soon")).length;
  const freshCount = pantry.filter(i => !i.status?.includes("expiring") && !i.status?.includes("soon")).length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --cream: #F7F4EE;
          --parchment: #EDE9DF;
          --sage: #4A6741;
          --sage-light: #6B8F62;
          --sage-muted: #C8D8C4;
          --terra: #C4622D;
          --amber: #D4913A;
          --charcoal: #2C2C2A;
          --muted: #8A8780;
          --white: #FFFFFF;
          --red-soft: #E8C5B8;
          --yellow-soft: #EEE0BC;
          --green-soft: #C4D9BF;
        }

        body { font-family: 'DM Sans', sans-serif; background: var(--cream); color: var(--charcoal); }

        .serif { font-family: 'DM Serif Display', Georgia, serif; }

        .app { display: flex; min-height: 100vh; }

        /* ── SIDEBAR ── */
        .sidebar {
          width: 260px;
          min-width: 260px;
          background: var(--charcoal);
          display: flex;
          flex-direction: column;
          padding: 32px 24px;
          position: sticky;
          top: 0;
          height: 100vh;
          overflow: hidden;
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
        }

        .logo-icon {
          width: 36px; height: 36px;
          background: var(--sage);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px;
        }

        .logo-text {
          font-family: 'DM Serif Display', serif;
          font-size: 22px;
          color: var(--cream);
          letter-spacing: -0.3px;
        }

        .sidebar-tagline {
          font-size: 11px;
          color: var(--muted);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-bottom: 40px;
          padding-left: 46px;
        }

        .sidebar-divider {
          height: 1px;
          background: rgba(255,255,255,0.07);
          margin: 20px 0;
        }

        .sidebar-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--muted);
          margin-bottom: 12px;
        }

        .stat-row {
          display: flex; flex-direction: column; gap: 8px; margin-bottom: 24px;
        }

        .stat-chip {
          display: flex; align-items: center; justify-content: space-between;
          padding: 10px 14px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 500;
        }
        .stat-chip.red { background: rgba(196,98,45,0.18); color: #E8916A; }
        .stat-chip.amber { background: rgba(212,145,58,0.18); color: #E8B96A; }
        .stat-chip.green { background: rgba(74,103,65,0.22); color: #8FBF85; }

        .stat-dot {
          width: 8px; height: 8px; border-radius: 50%;
          display: inline-block; margin-right: 8px;
        }
        .stat-dot.red { background: #C4622D; }
        .stat-dot.amber { background: #D4913A; }
        .stat-dot.green { background: var(--sage-light); }

        .sidebar-nav {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .nav-item {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 14px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 500;
          color: var(--muted);
          cursor: pointer;
          transition: all 0.15s ease;
          border: none; background: none; text-align: left; width: 100%;
        }
        .nav-item:hover { background: rgba(255,255,255,0.05); color: var(--cream); }
        .nav-item.active { background: rgba(255,255,255,0.1); color: var(--cream); }
        .nav-icon { font-size: 16px; width: 20px; text-align: center; }

        .sidebar-footer {
          padding-top: 20px;
          border-top: 1px solid rgba(255,255,255,0.07);
        }

        .user-card {
          display: flex; align-items: center; gap: 12px;
          padding: 12px;
          border-radius: 12px;
          background: rgba(255,255,255,0.06);
        }
        .avatar {
          width: 34px; height: 34px;
          background: var(--sage);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-weight: 600; font-size: 14px; color: white;
        }
        .user-name { font-size: 13px; color: var(--cream); font-weight: 500; }
        .user-sub { font-size: 11px; color: var(--muted); }

        /* ── MAIN ── */
        .main { flex: 1; padding: 40px 48px; overflow-y: auto; }

        .main-header {
          display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px;
        }

        .page-title {
          font-family: 'DM Serif Display', serif;
          font-size: 36px;
          color: var(--charcoal);
          line-height: 1.1;
          letter-spacing: -0.5px;
        }
        .page-title em { color: var(--sage); font-style: italic; }

        .page-sub { font-size: 14px; color: var(--muted); margin-top: 6px; }

        .header-actions { display: flex; gap: 12px; align-items: center; }

        .btn-primary {
          display: flex; align-items: center; gap: 8px;
          background: var(--sage);
          color: white;
          border: none;
          padding: 12px 22px;
          border-radius: 100px;
          font-size: 14px;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        .btn-primary:hover { background: var(--sage-light); transform: translateY(-1px); box-shadow: 0 6px 20px rgba(74,103,65,0.3); }
        .btn-primary:active { transform: translateY(0); }
        .btn-primary:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }

        /* ── UPLOAD ZONE ── */
        .upload-zone {
          border: 2px dashed var(--sage-muted);
          border-radius: 20px;
          padding: 48px 32px;
          text-align: center;
          background: white;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-bottom: 32px;
          position: relative;
          overflow: hidden;
        }
        .upload-zone::before {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(ellipse at 60% 0%, rgba(74,103,65,0.04) 0%, transparent 70%);
          pointer-events: none;
        }
        .upload-zone:hover, .upload-zone.drag-over {
          border-color: var(--sage);
          background: rgba(74,103,65,0.03);
        }

        .upload-icon-wrap {
          width: 60px; height: 60px;
          background: var(--parchment);
          border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 16px;
          font-size: 26px;
          transition: transform 0.2s ease;
        }
        .upload-zone:hover .upload-icon-wrap { transform: scale(1.08); }

        .upload-title { font-size: 16px; font-weight: 600; color: var(--charcoal); margin-bottom: 6px; }
        .upload-sub { font-size: 13px; color: var(--muted); margin-bottom: 20px; }

        .upload-formats {
          display: flex; gap: 8px; justify-content: center; margin-bottom: 20px;
        }
        .format-tag {
          font-size: 11px; font-weight: 600;
          padding: 4px 10px; border-radius: 100px;
          background: var(--parchment); color: var(--muted);
          letter-spacing: 0.04em; text-transform: uppercase;
        }

        .upload-btn-label {
          display: inline-flex; align-items: center; gap: 8px;
          background: var(--sage);
          color: white; padding: 11px 24px;
          border-radius: 100px; font-size: 14px; font-weight: 500;
          cursor: pointer; transition: all 0.2s ease;
        }
        .upload-btn-label:hover { background: var(--sage-light); }

        .upload-success-banner {
          position: absolute; bottom: 0; left: 0; right: 0;
          background: var(--sage);
          color: white;
          font-size: 13px; font-weight: 500;
          padding: 10px;
          text-align: center;
          animation: slideUp 0.3s ease;
        }

        .loading-bar {
          position: absolute; bottom: 0; left: 0;
          height: 3px;
          background: var(--sage);
          animation: loadPulse 1.2s ease-in-out infinite;
          width: 60%;
          border-radius: 2px;
        }

        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes loadPulse {
          0% { left: -60%; width: 60%; }
          100% { left: 100%; width: 60%; }
        }

        /* ── TABS ── */
        .tabs {
          display: flex;
          gap: 4px;
          background: var(--parchment);
          padding: 4px;
          border-radius: 14px;
          margin-bottom: 24px;
          width: fit-content;
        }
        .tab {
          padding: 9px 22px;
          border-radius: 10px;
          font-size: 13px; font-weight: 500;
          cursor: pointer; border: none; background: none;
          color: var(--muted);
          font-family: 'DM Sans', sans-serif;
          transition: all 0.15s ease;
        }
        .tab.active {
          background: white;
          color: var(--charcoal);
          box-shadow: 0 1px 4px rgba(0,0,0,0.08);
        }

        /* ── PANTRY GRID ── */
        .pantry-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 14px;
        }

        .pantry-card {
          border-radius: 16px;
          padding: 18px 20px;
          display: flex; flex-direction: column; gap: 12px;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
          position: relative; overflow: hidden;
        }
        .pantry-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.09); }

        .pantry-card.fresh { background: white; border: 1.5px solid var(--green-soft); }
        .pantry-card.soon { background: #FFFBF0; border: 1.5px solid var(--yellow-soft); }
        .pantry-card.expiring { background: #FFF8F5; border: 1.5px solid var(--red-soft); }

        .card-top { display: flex; justify-content: space-between; align-items: flex-start; }

        .item-name { font-size: 14px; font-weight: 600; color: var(--charcoal); flex: 1; line-height: 1.3; }
        .item-qty {
          font-size: 12px; font-weight: 600;
          padding: 3px 10px; border-radius: 100px;
          margin-left: 8px;
        }
        .fresh .item-qty { background: var(--green-soft); color: var(--sage); }
        .soon .item-qty { background: var(--yellow-soft); color: #8A6A20; }
        .expiring .item-qty { background: var(--red-soft); color: #8A3820; }

        .status-row {
          display: flex; align-items: center; gap: 6px;
          font-size: 12px; font-weight: 500;
        }
        .status-dot {
          width: 7px; height: 7px; border-radius: 50%;
        }
        .fresh .status-dot { background: var(--sage-light); }
        .soon .status-dot { background: var(--amber); }
        .expiring .status-dot { background: var(--terra); }

        .fresh .status-text { color: var(--sage); }
        .soon .status-text { color: #8A6A20; }
        .expiring .status-text { color: var(--terra); }

        .empty-state {
          grid-column: 1 / -1;
          text-align: center;
          padding: 60px 20px;
          color: var(--muted);
        }
        .empty-icon { font-size: 48px; margin-bottom: 16px; opacity: 0.5; }
        .empty-title { font-size: 16px; font-weight: 600; color: var(--charcoal); margin-bottom: 6px; }
        .empty-sub { font-size: 14px; }

        /* ── MEALS ── */
        .meals-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }

        .meal-card {
          background: white;
          border-radius: 20px;
          padding: 24px;
          border: 1.5px solid var(--parchment);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
          position: relative; overflow: hidden;
        }
        .meal-card::after {
          content: '';
          position: absolute; top: 0; right: 0;
          width: 80px; height: 80px;
          background: radial-gradient(circle at top right, rgba(74,103,65,0.07) 0%, transparent 70%);
        }
        .meal-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(0,0,0,0.08); }

        .meal-number {
          font-size: 11px; font-weight: 600; letter-spacing: 0.08em;
          text-transform: uppercase; color: var(--sage);
          margin-bottom: 8px;
        }

        .meal-name {
          font-family: 'DM Serif Display', serif;
          font-size: 20px; color: var(--charcoal);
          margin-bottom: 10px; line-height: 1.25;
        }

        .meal-desc { font-size: 13px; color: var(--muted); margin-bottom: 16px; line-height: 1.5; }

        .ingredient-chips {
          display: flex; flex-wrap: wrap; gap: 6px;
        }

        .chip {
          font-size: 11px; font-weight: 500;
          padding: 5px 11px;
          background: var(--parchment);
          color: var(--charcoal);
          border-radius: 100px;
          transition: background 0.15s ease;
        }
        .chip:hover { background: var(--sage-muted); color: var(--sage); }

        .meals-empty {
          text-align: center; padding: 80px 20px; color: var(--muted);
        }
        .meals-empty-icon { font-size: 52px; margin-bottom: 20px; }
        .meals-empty-title { font-family: 'DM Serif Display', serif; font-size: 22px; color: var(--charcoal); margin-bottom: 8px; }
        .meals-empty-sub { font-size: 14px; margin-bottom: 28px; }

        /* ── SUMMARY STRIP ── */
        .summary-strip {
          display: flex; gap: 16px; margin-bottom: 28px;
        }
        .summary-card {
          flex: 1; background: white;
          border-radius: 16px; padding: 18px 20px;
          border: 1.5px solid var(--parchment);
          display: flex; flex-direction: column; gap: 4px;
        }
        .summary-value {
          font-family: 'DM Serif Display', serif;
          font-size: 28px; line-height: 1;
          color: var(--charcoal);
        }
        .summary-label { font-size: 12px; color: var(--muted); font-weight: 500; }

        /* scrollbar */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--parchment); border-radius: 3px; }

        @media (max-width: 960px) {
          .sidebar { display: none; }
          .main { padding: 24px 20px; }
          .page-title { font-size: 26px; }
          .summary-strip { flex-wrap: wrap; }
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
              {expiringCount > 0 && (
                <div className="stat-chip red">
                  <span><span className="stat-dot red" style={{display:'inline-block'}}></span>Expiring soon</span>
                  <strong>{expiringCount}</strong>
                </div>
              )}
              {soonCount > 0 && (
                <div className="stat-chip amber">
                  <span><span className="stat-dot amber" style={{display:'inline-block'}}></span>Use this week</span>
                  <strong>{soonCount}</strong>
                </div>
              )}
              <div className="stat-chip green">
                <span><span className="stat-dot green" style={{display:'inline-block'}}></span>Fresh items</span>
                <strong>{freshCount}</strong>
              </div>
            </div>

            <div className="sidebar-divider"></div>

            <div className="sidebar-nav">
              <button className={`nav-item ${activeTab === "pantry" ? "active" : ""}`} onClick={() => setActiveTab("pantry")}>
                <span className="nav-icon">📦</span> Pantry
              </button>
              <button className={`nav-item ${activeTab === "meals" ? "active" : ""}`} onClick={() => setActiveTab("meals")}>
                <span className="nav-icon">🍽️</span> Meal Plans
              </button>
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
                {activeTab === "pantry" ? <>Your <em>Pantry</em></> : <>Meal <em>Suggestions</em></>}
              </h1>
              <p className="page-sub">
                {activeTab === "pantry"
                  ? "Upload a grocery invoice to auto-populate your pantry"
                  : "AI-generated meals based on your current pantry"}
              </p>
            </div>
            <div className="header-actions">
              <button className="btn-primary" onClick={generateMeals} disabled={loading || pantry.length === 0}>
                {loading ? "⏳ Working…" : "✨ Generate Meals"}
              </button>
            </div>
          </div>

          {/* Summary strip */}
          <div className="summary-strip">
            <div className="summary-card">
              <div className="summary-value">{pantry.length}</div>
              <div className="summary-label">Total Items</div>
            </div>
            <div className="summary-card">
              <div className="summary-value" style={{ color: expiringCount > 0 ? "var(--terra)" : "inherit" }}>
                {expiringCount}
              </div>
              <div className="summary-label">Expiring Soon</div>
            </div>
            <div className="summary-card">
              <div className="summary-value">{meals ? (Array.isArray(meals?.meal_plan) ? meals.meal_plan.length : Object.keys(meals?.meal_plan?.day_1 || {}).length) : "—"}</div>
              <div className="summary-label">Meal Ideas</div>
            </div>
          </div>

          {/* Upload zone */}
          <div
            className={`upload-zone${dragOver ? " drag-over" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <div className="upload-icon-wrap">📄</div>
            <p className="upload-title">Drop your grocery invoice here</p>
            <p className="upload-sub">or browse to upload a file from your device</p>
            <div className="upload-formats">
              <span className="format-tag">PDF</span>
              <span className="format-tag">JPG</span>
              <span className="format-tag">PNG</span>
              <span className="format-tag">CSV</span>
            </div>
            <input type="file" onChange={handleUpload} className="hidden" id="upload" style={{display:'none'}} />
            <label htmlFor="upload" className="upload-btn-label">
              📂 Browse files
            </label>

            {loading && <div className="loading-bar" />}
            {uploadSuccess && <div className="upload-success-banner">✓ Pantry updated successfully!</div>}
          </div>

          {/* Tabs */}
          <div className="tabs">
            <button className={`tab${activeTab === "pantry" ? " active" : ""}`} onClick={() => setActiveTab("pantry")}>
              📦 Pantry ({pantry.length})
            </button>
            <button className={`tab${activeTab === "meals" ? " active" : ""}`} onClick={() => setActiveTab("meals")}>
              🍽️ Meal Suggestions
            </button>
          </div>

          {/* Pantry Tab */}
          {activeTab === "pantry" && (
            <div className="pantry-grid">
              {pantry.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🛒</div>
                  <div className="empty-title">Your pantry is empty</div>
                  <div className="empty-sub">Upload a grocery invoice above to get started</div>
                </div>
              ) : (
                pantry.map((item, i) => {
                  const isExpiring = item.status?.includes("expiring");
                  const isSoon = item.status?.includes("soon");
                  const cardClass = isExpiring ? "expiring" : isSoon ? "soon" : "fresh";
                  return (
                    <div key={i} className={`pantry-card ${cardClass}`}>
                      <div className="card-top">
                        <span className="item-name">{item.name}</span>
                        <span className="item-qty">×{item.qty}</span>
                      </div>
                      <div className="status-row">
                        <span className="status-dot" />
                        <span className="status-text">{item.status || "In stock"}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Meals Tab */}
          {activeTab === "meals" && (
            <>
              {!meals ? (
                <div className="meals-empty">
                  <div className="meals-empty-icon">🍳</div>
                  <div className="meals-empty-title serif">Nothing cooked up yet</div>
                  <div className="meals-empty-sub">Hit "Generate Meals" to get personalised recipe ideas from your pantry</div>
                  <button className="btn-primary" onClick={generateMeals} disabled={loading || pantry.length === 0} style={{margin:'0 auto'}}>
                    ✨ Generate Meals
                  </button>
                </div>
              ) : (
                <div className="meals-grid">
                  {/* ARRAY FORMAT */}
                  {Array.isArray(meals?.meal_plan) &&
                    meals.meal_plan.map((meal: any, i: number) => (
                      <div key={i} className="meal-card">
                        <div className="meal-number">Suggestion {i + 1}</div>
                        <div className="meal-name serif">{meal.meal_name || meal.name || meal.dish}</div>
                        {meal.description && <p className="meal-desc">{meal.description}</p>}
                        <div className="ingredient-chips">
                          {(meal.ingredients_used || []).map((ing: string, j: number) => (
                            <span key={j} className="chip">{ing}</span>
                          ))}
                        </div>
                      </div>
                    ))}

                  {/* NESTED FORMAT */}
                  {meals?.meal_plan?.day_1 &&
                    Object.entries(meals.meal_plan.day_1).map(([mealType, data]: any, i: number) => (
                      <div key={mealType} className="meal-card">
                        <div className="meal-number">{mealType}</div>
                        <div className="meal-name serif">{data?.dish}</div>
                        <div className="ingredient-chips">
                          {(data?.ingredients_used || []).map((ing: string, j: number) => (
                            <span key={j} className="chip">{ing}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </>
  );
}