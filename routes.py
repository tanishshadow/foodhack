"use client";

import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState(null);

  return (
    <div className="flex min-h-screen bg-[#f5f5f2]">
      
      {/* Sidebar */}
      <div className="w-64 bg-[#f1f1ed] p-6 flex flex-col justify-between">
        <div>
          <h1 className="text-xl font-bold text-green-800">FoodWell</h1>
          <p className="text-xs text-gray-500 mb-6">
            AI-powered pantry brain · IMPACT AI 3.0
          </p>

          {/* User Card */}
          <div className="bg-white rounded-xl p-3 flex items-center gap-3 mb-6">
            <div className="bg-green-700 text-white w-8 h-8 flex items-center justify-center rounded-full">
              R
            </div>
            <div>
              <p className="text-sm font-semibold">Good evening, Riya</p>
              <p className="text-xs text-gray-500">Pantry: 85% stocked</p>
            </div>
          </div>

          {/* Nav */}
          <div className="space-y-2">
            <div className="bg-green-800 text-white px-4 py-2 rounded-lg font-medium">
              Invoice → Pantry
            </div>
            <div className="px-4 py-2 text-gray-700">Pantry</div>
            <div className="px-4 py-2 text-gray-700">Meal Planner</div>
          </div>
        </div>

        {/* Bottom */}
        <div className="text-xs text-gray-500">
          <p className="font-semibold mb-2">V2 ROADMAP</p>
          <ul className="space-y-1">
            <li>📷 Barcode Scanner</li>
            <li>💰 Price Comparison</li>
            <li>📈 Restock Predictor</li>
          </ul>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        
        {/* Top bar */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">
            Invoice → Pantry
            <span className="ml-3 bg-green-200 text-green-800 text-xs px-2 py-1 rounded-full">
              ✨ CLAUDE VISION
            </span>
          </h2>

          <button className="bg-green-800 text-white px-4 py-2 rounded-full">
            Generate Meal Plan
          </button>
        </div>

        {/* Hero Card */}
        <div className="bg-green-800 text-white rounded-2xl p-8 mb-8 relative overflow-hidden">
          <p className="text-sm opacity-80 mb-2">MAGIC MOMENT #1</p>
          <h1 className="text-3xl font-bold mb-3">
            Photo in.<br />Pantry populated.
          </h1>
          <p className="text-sm opacity-80 max-w-md">
            Upload your Zepto, Blinkit, or BigBasket invoice.
            AI reads every item — zero manual entry.
          </p>
        </div>

        {/* Upload Box */}
        <div className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center bg-white">
          <div className="mb-4 text-4xl">☁️</div>

          <p className="font-semibold text-lg mb-2">
            Drop your grocery invoice here
          </p>

          <p className="text-gray-500 text-sm mb-4">
            Zepto · Blinkit · BigBasket · Any photo of a bill
          </p>

          <div className="flex justify-center gap-2 mb-4 text-xs text-gray-500">
            <span>JPG</span>
            <span>PNG</span>
            <span>PDF</span>
            <span>WEBP</span>
          </div>

          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            className="hidden"
            id="upload"
          />

          <label
            htmlFor="upload"
            className="bg-green-800 text-white px-6 py-2 rounded-full cursor-pointer"
          >
            Browse files
          </label>
        </div>
      </div>
    </div>
  );
}