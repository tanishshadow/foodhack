"use client";

import { useState, useEffect } from "react";

const BASE_URL = "http://localhost:8000";

export default function Home() {
  const [pantry, setPantry] = useState<any[]>([]);
  const [meals, setMeals] = useState<any>(null);
  const [loading, setLoading] = useState(false);

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

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);

    await fetch(`${BASE_URL}/invoice/upload`, {
      method: "POST",
      body: formData,
    });

    await fetchPantry();
    setLoading(false);
  };

  const generateMeals = async () => {
    setLoading(true);

    const res = await fetch(`${BASE_URL}/meals/generate`);
    const data = await res.json();

    console.log(data); // debug

    setMeals(data);
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen bg-[#f5f5f2]">
      
      {/* Sidebar */}
      <div className="w-64 bg-[#f1f1ed] p-6 flex flex-col justify-between">
        <div>
          <h1 className="text-xl font-bold text-green-800">FoodWell</h1>
          <p className="text-xs text-gray-500 mb-6">
            AI-powered pantry brain
          </p>

          <div className="bg-white rounded-xl p-3 flex items-center gap-3 mb-6">
            <div className="bg-green-700 text-white w-8 h-8 flex items-center justify-center rounded-full">
              U
            </div>
            <div>
              <p className="text-sm font-semibold">Welcome back</p>
              <p className="text-xs text-gray-500">
                Pantry: {pantry.length} items
              </p>
            </div>
          </div>

          <div className="bg-green-800 text-white px-4 py-2 rounded-lg font-medium">
            Invoice → Pantry
          </div>
        </div>

        <div className="text-xs text-gray-500">
          <p className="font-semibold mb-2">Features</p>
          <ul className="space-y-1">
            <li>📸 Invoice Scan</li>
            <li>📦 Pantry Tracking</li>
            <li>🍽️ Meal Planner</li>
          </ul>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 p-8">

        {/* Top */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">
            Invoice → Pantry
          </h2>

          <button
            onClick={generateMeals}
            className="bg-green-800 text-white px-4 py-2 rounded-full"
          >
            Generate Meals
          </button>
        </div>

        {/* Hero */}
        <div className="bg-green-800 text-white rounded-2xl p-8 mb-8">
          <h1 className="text-3xl font-bold mb-3">
            Upload. Track. Eat Smart.
          </h1>
          <p className="text-sm opacity-80">
            AI reads your invoice and builds your pantry instantly.
          </p>
        </div>

        {/* Upload */}
        <div className="border-2 border-dashed border-gray-300 rounded-2xl p-10 text-center bg-white mb-6">
          <p className="font-semibold text-lg mb-2">
            Upload grocery invoice
          </p>

          <input
            type="file"
            onChange={handleUpload}
            className="hidden"
            id="upload"
          />

          <label
            htmlFor="upload"
            className="bg-green-800 text-white px-6 py-2 rounded-full cursor-pointer"
          >
            Browse files
          </label>

          {loading && <p className="mt-3 text-sm">Processing...</p>}
        </div>

        {/* Pantry */}
        <div className="bg-white p-5 rounded-2xl shadow mb-6">
          <h3 className="font-semibold mb-4 text-lg">Pantry</h3>

          {pantry.length === 0 && (
            <p className="text-sm text-gray-500">No items yet</p>
          )}

          {pantry.map((item, i) => (
            <div
              key={i}
              className={`p-3 mb-3 rounded-lg flex justify-between items-center ${
                item.status?.includes("expiring")
                  ? "bg-red-500 text-white"
                  : item.status?.includes("soon")
                  ? "bg-yellow-400 text-black"
                  : "bg-green-500 text-white"
              }`}
            >
              <span className="font-medium">
                {item.name} ({item.qty})
              </span>

              <span className="text-sm font-semibold">
                {item.status}
              </span>
            </div>
          ))}
        </div>

        {/* Meals */}
        <div className="bg-white p-5 rounded-2xl shadow">
          <h3 className="font-semibold mb-4 text-lg">Meal Suggestions</h3>

          {!meals && (
            <p className="text-sm text-gray-500">
              Click "Generate Meals"
            </p>
          )}

          {/* ARRAY FORMAT */}
          {Array.isArray(meals?.meal_plan) &&
            meals.meal_plan.map((meal: any, i: number) => (
              <div key={i} className="mb-4 p-4 bg-gray-100 rounded-xl">
                <h3 className="font-semibold text-lg">
                  {meal.meal_name || meal.name || meal.dish}
                </h3>

                {meal.description && (
                  <p className="text-sm text-gray-600 mb-2">
                    {meal.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-2">
                  {(meal.ingredients_used || []).map(
                    (ing: string, j: number) => (
                      <span
                        key={j}
                        className="bg-green-200 text-green-800 px-2 py-1 rounded text-xs"
                      >
                        {ing}
                      </span>
                    )
                  )}
                </div>
              </div>
            ))}

          {/* NESTED FORMAT */}
          {meals?.meal_plan?.day_1 &&
            Object.entries(meals.meal_plan.day_1).map(
              ([meal, data]: any) => (
                <div key={meal} className="mb-4 p-4 bg-gray-100 rounded-xl">
                  <p className="text-sm text-gray-500 capitalize">
                    {meal}
                  </p>

                  <h3 className="font-semibold text-lg">
                    {data?.dish}
                  </h3>

                  <div className="flex flex-wrap gap-2">
                    {(data?.ingredients_used || []).map(
                      (ing: string, i: number) => (
                        <span
                          key={i}
                          className="bg-green-200 text-green-800 px-2 py-1 rounded text-xs"
                        >
                          {ing}
                        </span>
                      )
                    )}
                  </div>
                </div>
              )
            )}
        </div>
      </div>
    </div>
  );
}