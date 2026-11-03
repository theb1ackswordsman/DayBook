import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  useGetMyCheckInsQuery,
  useDeleteMyCheckInsMutation,
} from "../redux/api/checkInsApiSlice";
import { TRAIT_META } from "../config/miniIpipData";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import { toast } from "react-toastify";
import {
  FaHeartbeat,
  FaBrain,
  FaCalendarAlt,
  FaTrash,
  FaLock,
  FaChartLine,
  FaChartPie,
} from "react-icons/fa";

const CheckInHub = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const { data: checkInsData, isLoading } = useGetMyCheckInsQuery(undefined, {
    skip: !user,
  });
  const [deleteMyCheckIns, { isLoading: isDeleting }] = useDeleteMyCheckInsMutation();

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const checkIns = checkInsData?.data || [];
  const who5CheckIns = checkIns.filter((c) => c.type === "who5" || !c.type);
  const personalityCheckIns = checkIns.filter((c) => c.type === "mini_ipip");
  const latestWho5 = who5CheckIns[0] || null;
  const latestPersonality = personalityCheckIns[0] || null;

  const handleDeleteHistory = async () => {
    try {
      await deleteMyCheckIns().unwrap();
      setConfirmDeleteOpen(false);
      toast.success("Check-in history cleared.");
    } catch {
      toast.error("Failed to delete history.");
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto pb-12">
      {/* Header */}
      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
          <FaHeartbeat className="text-sm" />
          <span>Self-Reflection</span>
        </div>
        <h1 className="text-2xl font-bold text-text">Check-in Hub</h1>
        <p className="text-xs text-text-muted leading-relaxed">
          Gentle, private check-ins to help you understand your emotional well-being and personal patterns.
        </p>
      </header>

      {/* Two Check-in Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* 1. Wellbeing Check (WHO-5) */}
        <Card
          variant="default"
          className="p-5 flex flex-col justify-between gap-4 border border-border hover:border-primary/40 transition-colors shadow-sm"
        >
          <div className="flex flex-col gap-2">
            <div className="w-10 h-10 rounded-[18px] bg-primary-soft text-primary flex items-center justify-center text-lg">
              <FaHeartbeat />
            </div>
            <h2 className="text-base font-bold text-text">Wellbeing Check</h2>
            <p className="text-xs text-text-muted leading-relaxed">
              The 5-question WHO-5 index reflects on your emotional energy, calm, and spirits over the last two weeks.
            </p>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-border/60">
            <span className="text-[11px] text-text-muted">~2 mins</span>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate("/check-in/who5")}
            >
              Start check-in &rarr;
            </Button>
          </div>
        </Card>

        {/* 2. Personality Snapshot (Mini-IPIP) - LIVE */}
        <Card
          variant="default"
          className="p-5 flex flex-col justify-between gap-4 border border-border hover:border-accent/40 transition-colors shadow-sm"
        >
          <div className="flex flex-col gap-2">
            <div className="w-10 h-10 rounded-[18px] bg-accent/15 text-accent flex items-center justify-center text-lg">
              <FaBrain />
            </div>
            <h2 className="text-base font-bold text-text">Personality Snapshot</h2>
            <p className="text-xs text-text-muted leading-relaxed">
              Explore your Big Five tendencies (Extraversion, Agreeableness, Conscientiousness, Neuroticism, Openness) with the 20-item Mini-IPIP.
            </p>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-border/60">
            <span className="text-[11px] text-text-muted">~3 mins</span>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate("/check-in/personality")}
            >
              Start snapshot &rarr;
            </Button>
          </div>
        </Card>
      </div>

      {/* Community Insights Banner */}
      <div className="p-4 rounded-[20px] bg-surface border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm hover:border-primary/40 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[18px] bg-primary-soft text-primary flex items-center justify-center text-base shrink-0">
            <FaChartPie />
          </div>
          <div>
            <h3 className="text-xs font-bold text-text">Community Pulse &amp; Insights</h3>
            <p className="text-[11px] text-text-muted leading-tight">
              Aggregated wellbeing index &amp; Big Five tendencies across 15 members
            </p>
          </div>
        </div>
        <Link to="/insights" className="shrink-0">
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            View Insights &rarr;
          </Button>
        </Link>
      </div>

      {/* Latest Personality Snapshot Card (if taken) */}
      {latestPersonality?.traits && (
        <Card variant="default" className="p-5 flex flex-col gap-4 border border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-accent/15 text-accent flex items-center justify-center text-sm">
                <FaBrain />
              </div>
              <div>
                <h3 className="text-xs font-bold text-text">Latest Personality Snapshot</h3>
                <p className="text-[10px] text-text-muted">
                  Recorded on{" "}
                  {new Date(latestPersonality.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/check-in/personality")}
            >
              View / Retake &rarr;
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-1">
            {["extraversion", "agreeableness", "conscientiousness", "neuroticism", "openness"].map(
              (traitKey) => {
                const meta = TRAIT_META[traitKey];
                const score = latestPersonality.traits[traitKey] ?? 12;
                const percent = Math.min(100, Math.max(0, ((score - 4) / 16) * 100));

                return (
                  <div
                    key={traitKey}
                    className="p-3 rounded-[16px] bg-surface-raised border border-border/60 flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-text truncate">
                        {meta?.name?.split(" ")[0]}
                      </span>
                      <span className="text-[10px] font-bold text-text-muted">
                        {score}/20
                      </span>
                    </div>
                    <div className="w-full bg-border/40 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${percent}%`,
                          backgroundColor: meta?.color || "#38bdf8",
                        }}
                      />
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </Card>
      )}

      {/* Private History Section */}
      <section className="flex flex-col gap-4 mt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaChartLine className="text-primary text-sm" />
            <h2 className="text-sm font-bold text-text">Your Private History</h2>
          </div>
          {checkIns.length > 0 && (
            <button
              type="button"
              onClick={() => setConfirmDeleteOpen(true)}
              className="text-xs text-text-muted hover:text-danger font-medium flex items-center gap-1 cursor-pointer"
            >
              <FaTrash className="text-[10px]" /> Clear history
            </button>
          )}
        </div>

        {!user ? (
          <Card variant="default" className="p-6 text-center flex flex-col items-center gap-2">
            <FaLock className="text-xl text-text-muted mb-1" />
            <p className="text-xs font-bold text-text">Sign in to track your reflections</p>
            <p className="text-xs text-text-muted max-w-xs leading-relaxed">
              Your check-ins are strictly private and never shared publicly or stored with individual item answers.
            </p>
            <Link to="/login" className="mt-2">
              <Button variant="primary" size="sm">Sign in</Button>
            </Link>
          </Card>
        ) : isLoading ? (
          <Card variant="default" className="p-6 text-center text-xs text-text-muted">
            Loading your reflection history...
          </Card>
        ) : checkIns.length === 0 ? (
          <Card variant="default" className="p-6 text-center flex flex-col items-center gap-2">
            <FaHeartbeat className="text-2xl text-text-muted mb-1" />
            <p className="text-xs font-bold text-text">No check-ins yet</p>
            <p className="text-xs text-text-muted max-w-sm leading-relaxed">
              Take your first WHO-5 check-in or Personality Snapshot to begin tracking your reflections over time.
            </p>
            <div className="flex gap-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/check-in/who5")}
              >
                Wellbeing Check
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate("/check-in/personality")}
              >
                Personality Snapshot
              </Button>
            </div>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {/* SVG Trend Line Chart (for WHO-5 check-ins) */}
            {who5CheckIns.length > 0 && (
              <Card variant="default" className="p-5 flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs text-text-muted">
                  <span>Wellbeing Trend (0-100)</span>
                  <span className="font-bold text-text">
                    Latest: {latestWho5.score} ({latestWho5.band})
                  </span>
                </div>

                {/* Responsive SVG Sparkline / Line Chart */}
                <div className="w-full h-32 relative">
                  <svg
                    className="w-full h-full overflow-visible"
                    viewBox={`0 0 ${Math.max(120, who5CheckIns.length * 50)} 80`}
                    preserveAspectRatio="none"
                  >
                    {/* Subtle Reference Thresholds */}
                    <line
                      x1="0"
                      y1="40"
                      x2={Math.max(120, who5CheckIns.length * 50)}
                      y2="40"
                      stroke="var(--border)"
                      strokeDasharray="3 3"
                      strokeWidth="1"
                    />
                    <line
                      x1="0"
                      y1="24"
                      x2={Math.max(120, who5CheckIns.length * 50)}
                      y2="24"
                      stroke="var(--border)"
                      strokeDasharray="3 3"
                      strokeWidth="1"
                    />

                    {/* Polyline of points (oldest to newest) */}
                    {(() => {
                      const sorted = [...who5CheckIns].reverse();
                      const total = sorted.length;
                      const stepX =
                        total > 1
                          ? (Math.max(120, who5CheckIns.length * 50) - 20) / (total - 1)
                          : 60;

                      const points = sorted.map((c, i) => {
                        const x = total > 1 ? 10 + i * stepX : 60;
                        const y = 70 - (c.score / 100) * 60;
                        return { x, y, score: c.score, band: c.band, date: c.createdAt };
                      });

                      const pointsStr = points.map((p) => `${p.x},${p.y}`).join(" ");

                      return (
                        <>
                          <polyline
                            fill="none"
                            stroke="var(--primary)"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            points={pointsStr}
                          />
                          {points.map((p, idx) => (
                            <circle
                              key={idx}
                              cx={p.x}
                              cy={p.y}
                              r="3.5"
                              className="fill-primary stroke-surface"
                              strokeWidth="1.5"
                            />
                          ))}
                        </>
                      );
                    })()}
                  </svg>
                </div>
                <div className="flex justify-between text-[10px] text-text-muted">
                  <span>Older</span>
                  <span>Cutoff: 50 pts</span>
                  <span>Recent</span>
                </div>
              </Card>
            )}

            {/* List of past check-ins (both WHO-5 and Mini-IPIP) */}
            <div className="flex flex-col gap-2">
              {checkIns.map((item) => {
                const dateStr = new Date(item.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });

                if (item.type === "mini_ipip") {
                  return (
                    <div
                      key={item._id}
                      className="flex items-center justify-between p-3.5 bg-surface border border-border rounded-[18px]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-accent/15 text-accent flex items-center justify-center text-xs">
                          <FaBrain />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-text">Personality Snapshot</p>
                          <p className="text-[10px] text-text-muted">{dateStr}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap justify-end">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-accent/15 text-accent-dark">
                          Big Five
                        </span>
                        {item.traits && (
                          <span className="text-[10px] text-text-muted hidden sm:inline">
                            E:{item.traits.extraversion} A:{item.traits.agreeableness} C:{item.traits.conscientiousness}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                }

                // Default: WHO-5 check-in
                let badgeColor = "bg-primary-soft text-primary-dark";
                if (item.band === "Low well-being") {
                  badgeColor = "bg-accent/15 text-accent-dark";
                } else if (item.band === "Moderate well-being") {
                  badgeColor = "bg-sky-50 text-sky-800";
                }

                return (
                  <div
                    key={item._id}
                    className="flex items-center justify-between p-3.5 bg-surface border border-border rounded-[18px]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-surface-raised flex items-center justify-center text-text-muted text-xs">
                        <FaHeartbeat className="text-primary text-xs" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-text">Wellbeing Check</p>
                        <p className="text-[10px] text-text-muted">
                          {dateStr} &bull; Raw: {item.rawScore}/25
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${badgeColor}`}>
                        {item.band}
                      </span>
                      <span className="text-xs font-bold text-text">
                        {item.score}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* Confirmation Modal to Clear History */}
      <Modal
        isOpen={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        title="Delete Check-in History"
      >
        <div className="flex flex-col gap-4">
          <p className="text-xs text-text-muted leading-relaxed">
            Are you sure you want to delete all your past check-in records? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={isDeleting}
              onClick={handleDeleteHistory}
              className="bg-danger hover:bg-danger/90"
            >
              {isDeleting ? "Deleting..." : "Delete History"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CheckInHub;
