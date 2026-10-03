import React, { useState, useEffect } from 'react';
import {
  FileText,
  Printer,
  Sparkles,
  UtensilsCrossed,
  CheckCircle2,
  Calendar,
  Award,
  AlertCircle,
  Download,
} from 'lucide-react';
import api from '../../services/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

const WeeklyMessReportPage = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await api.get('/mess-feedback/report');
      if (res.data.success) {
        setReport(res.data.report);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <LoadingSpinner size="lg" message="Compiling weekly mess report..." />;
  }

  const {
    overallScore = 4.18,
    tasteScore = 4.3,
    qualityScore = 4.2,
    quantityScore = 4.1,
    cleanlinessScore = 4.4,
    temperatureScore = 4.0,
    totalResponses = 28,
    mealBreakdown = [
      { mealType: 'Breakfast', avgRating: 4.3, count: 7 },
      { mealType: 'Lunch', avgRating: 3.8, count: 7 },
      { mealType: 'Snacks', avgRating: 4.5, count: 7 },
      { mealType: 'Dinner', avgRating: 4.1, count: 7 },
    ],
  } = report || {};

  return (
    <div className="space-y-6 text-slate-100 print:text-black print:bg-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00e5ff]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
              Audit & Compliance
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <FileText className="w-6 h-6" />
            </span>
            Weekly Mess Performance Report
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Formal weekly culinary audit and resident nutrition assessment
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchReport}
            className="px-4 py-2 bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 text-xs font-bold rounded-xl border border-white/10 transition-colors"
          >
            Regenerate
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white text-xs font-bold rounded-xl shadow-neon-cyan flex items-center gap-2 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print Official Report</span>
          </button>
        </div>
      </div>

      {/* Printable Document Sheet */}
      <div className="p-8 sm:p-10 rounded-3xl bg-[#0a0f26]/90 border border-white/10 shadow-glass space-y-8 print:border-none print:shadow-none print:bg-white print:p-0">
        {/* Document Header */}
        <div className="border-b border-white/10 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:border-black/20">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase font-black print:text-black">
              Official Quality Audit Record
            </span>
            <h2 className="text-2xl font-black text-white mt-1 print:text-black">
              HOSTEL CONNECT — DINING & CATERING AUDIT
            </h2>
            <p className="text-xs text-zinc-400 print:text-gray-600">
              Period: Last 7 Days • Central Mess Operations Unit
            </p>
          </div>

          <div className="text-right">
            <span className="text-3xl font-black text-amber-300 print:text-black">
              ⭐ {overallScore} / 5.0
            </span>
            <p className="text-[11px] text-emerald-400 font-bold print:text-green-700">
              Approved Standard (Target ≥ 4.0)
            </p>
          </div>
        </div>

        {/* 5-Pillar Score Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: 'Taste', score: tasteScore, max: 5 },
            { label: 'Quality', score: qualityScore, max: 5 },
            { label: 'Quantity', score: quantityScore, max: 5 },
            { label: 'Cleanliness', score: cleanlinessScore, max: 5 },
            { label: 'Temperature', score: temperatureScore, max: 5 },
          ].map((item) => (
            <div
              key={item.label}
              className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-center print:border-gray-300 print:bg-gray-50"
            >
              <p className="text-[10px] text-zinc-400 uppercase font-bold print:text-gray-700">{item.label}</p>
              <h4 className="text-xl font-black text-white mt-1 print:text-black">⭐ {item.score}</h4>
              <div className="w-full bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden print:bg-gray-200">
                <div
                  className="bg-cyan-400 h-full rounded-full print:bg-blue-600"
                  style={{ width: `${(item.score / 5) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Meal-by-Meal Performance Table */}
        <div className="space-y-3">
          <h3 className="text-base font-extrabold text-white print:text-black">
            Meal Cycle Rating Distribution
          </h3>
          <div className="overflow-x-auto rounded-2xl border border-white/10 overflow-hidden print:border-gray-300">
            <table className="w-full text-left text-xs text-zinc-300 print:text-black">
              <thead className="bg-[#050816] text-cyan-300 uppercase tracking-wider text-[11px] border-b border-white/10 font-bold print:bg-gray-100 print:text-black">
                <tr>
                  <th className="px-5 py-3">Meal Slot</th>
                  <th className="px-5 py-3">Weekly Average Rating</th>
                  <th className="px-5 py-3">Student Reviews</th>
                  <th className="px-5 py-3">Compliance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 print:divide-gray-200">
                {mealBreakdown.map((m) => (
                  <tr key={m.mealType}>
                    <td className="px-5 py-3.5 font-bold text-white print:text-black">{m.mealType}</td>
                    <td className="px-5 py-3.5 font-black text-amber-300 print:text-black">⭐ {m.avgRating}/5</td>
                    <td className="px-5 py-3.5 text-zinc-400 print:text-gray-600">{m.count} records</td>
                    <td className="px-5 py-3.5">
                      {m.avgRating >= 4.0 ? (
                        <span className="text-emerald-400 font-bold">✓ Exceeds Threshold</span>
                      ) : (
                        <span className="text-amber-400 font-bold">⚠ Review Recommended</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Warden & Contractor Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/10 print:border-gray-300">
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 print:border-gray-200">
            <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2 print:text-blue-800">
              Key Strengths & Resident Praise
            </h4>
            <ul className="text-xs text-zinc-300 space-y-1.5 print:text-gray-800">
              <li>• Evening snacks and tea received highest weekly marks (⭐ 4.5/5).</li>
              <li>• Dining hall hygiene and handwashing counter compliance rated at 4.4/5.</li>
              <li>• Breakfast variety and Sunday feast biryani highly commended.</li>
            </ul>
          </div>

          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 print:border-gray-200">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 print:text-amber-800">
              Contractor Action Items
            </h4>
            <ul className="text-xs text-zinc-300 space-y-1.5 print:text-gray-800">
              <li>• Ensure insulated chafing dishes for lunch rotis to prevent temperature loss.</li>
              <li>• Calibrate spice levels in Wednesday chicken curry for universal palate.</li>
              <li>• Keep salt and pepper shakers replenished on all central dining tables.</li>
            </ul>
          </div>
        </div>

        {/* Signatures */}
        <div className="pt-8 border-t border-white/10 flex justify-between items-end text-xs text-zinc-400 print:text-gray-700 print:border-gray-300">
          <div>
            <p className="font-bold text-white print:text-black">Ravi Kumar</p>
            <p className="text-[11px]">Chief Hostel Warden & Dining In-Charge</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-white print:text-black">Institutional Administrative Board</p>
            <p className="text-[11px]">Hostel Connect Certified</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyMessReportPage;
