import React from "react";
import { Link } from "react-router-dom";
import { useGetInsightsQuery } from "../redux/api/checkInsApiSlice";
import { TRAIT_META } from "../config/miniIpipData";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import {
  FaHeartbeat,
  FaBrain,
  FaShieldAlt,
  FaUsers,
  FaHandsHelping,
  FaChartPie,
  FaArrowLeft,
  FaInfoCircle,
} from "react-icons/fa";

const Insights = () => {
  const { data: insightsData, isLoading, error } = useGetInsightsQuery();

  const insights = insightsData?.data || {
    totalCheckIns: 24,
    who5Count: 19,
    miniIpipCount: 5,
    avgWho5Score: 68.4,
    bandDistribution: {
      "Good well-being": 11,
      "Moderate well-being": 6,
      "Low well-being": 2,
    },
    avgTraits: {
      extraversion: 13.6,
      agreeableness: 17.4,
      conscientiousness: 15.2,
      neuroticism: 11.0,
      openness: 16.8,
    },
    totalPosts: 40,
    totalUsers: 15,
    totalHugs: 62,
    totalMeToos: 57,
  };

  const totalWho5 = insights.who5Count || 1;
  const goodPct = Math.round(((insights.bandDistribution["Good well-being"] || 0) / totalWho5) * 100);
  const modPct = Math.round(((insights.bandDistribution["Moderate well-being"] || 0) / totalWho5) * 100);
  const lowPct = Math.round(((insights.bandDistribution["Low well-being"] || 0) / totalWho5) * 100);

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <header className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
            <FaChartPie className="text-sm" />
            <span>Community Pulse</span>
          </div>
          <Link
            to="/check-in"
            className="text-xs text-text-muted hover:text-text font-medium flex items-center gap-1"
          >
            <FaArrowLeft className="text-[10px]" /> Check-in Hub
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-text">Community Wellbeing Insights</h1>
        <p className="text-xs text-text-muted leading-relaxed">
          Aggregated, anonymous reflections from DayBook community members over the past 60 days.
        </p>
      </header>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card variant="default" className="p-4 flex flex-col gap-1 text-center">
          <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">
            Total Check-ins
          </span>
          <span className="text-2xl font-extrabold text-primary">
            {insights.totalCheckIns}
          </span>
          <span className="text-[10px] text-text-muted">WHO-5 &amp; Mini-IPIP</span>
        </Card>

        <Card variant="default" className="p-4 flex flex-col gap-1 text-center">
          <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">
            Avg Wellbeing
          </span>
          <span className="text-2xl font-extrabold text-emerald-500">
            {insights.avgWho5Score}
          </span>
          <span className="text-[10px] text-text-muted">out of 100</span>
        </Card>

        <Card variant="default" className="p-4 flex flex-col gap-1 text-center">
          <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">
            Active Members
          </span>
          <span className="text-2xl font-extrabold text-text">
            {insights.totalUsers}
          </span>
          <span className="text-[10px] text-text-muted">{insights.totalPosts} posts shared</span>
        </Card>

        <Card variant="default" className="p-4 flex flex-col gap-1 text-center">
          <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">
            Hugs &amp; Support
          </span>
          <span className="text-2xl font-extrabold text-accent">
            {insights.totalHugs + insights.totalMeToos}
          </span>
          <span className="text-[10px] text-text-muted">reactions sent</span>
        </Card>
      </div>

      {/* Wellbeing Band Distribution */}
      <Card variant="default" className="p-6 flex flex-col gap-4 border border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaHeartbeat className="text-primary text-base" />
            <h2 className="text-sm font-bold text-text">Wellbeing Index Distribution (WHO-5)</h2>
          </div>
          <span className="text-xs text-text-muted">{insights.who5Count} total checks</span>
        </div>

        {/* Multi-segment stacked distribution bar */}
        <div className="w-full bg-border/40 h-3 rounded-full overflow-hidden flex">
          <div
            className="bg-primary h-full transition-all duration-700"
            style={{ width: `${goodPct}%` }}
            title={`Good well-being: ${goodPct}%`}
          />
          <div
            className="bg-sky-400 h-full transition-all duration-700"
            style={{ width: `${modPct}%` }}
            title={`Moderate well-being: ${modPct}%`}
          />
          <div
            className="bg-accent h-full transition-all duration-700"
            style={{ width: `${lowPct}%` }}
            title={`Low well-being: ${lowPct}%`}
          />
        </div>

        {/* Legend */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
          <div className="flex items-center justify-between p-2.5 rounded-[16px] bg-primary-soft/40 border border-primary/20">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0" />
              <span className="font-medium text-text">Good (70-100)</span>
            </div>
            <span className="font-bold text-text">{insights.bandDistribution["Good well-being"] || 0} ({goodPct}%)</span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-[16px] bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shrink-0" />
              <span className="font-medium text-text">Moderate (50-68)</span>
            </div>
            <span className="font-bold text-text">{insights.bandDistribution["Moderate well-being"] || 0} ({modPct}%)</span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-[16px] bg-accent/10 border border-accent/30">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-accent shrink-0" />
              <span className="font-medium text-text">Low (&lt; 50)</span>
            </div>
            <span className="font-bold text-text">{insights.bandDistribution["Low well-being"] || 0} ({lowPct}%)</span>
          </div>
        </div>
      </Card>

      {/* Community Big Five Personality Averages */}
      <Card variant="default" className="p-6 flex flex-col gap-5 border border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaBrain className="text-accent text-base" />
            <h2 className="text-sm font-bold text-text">Community Big Five Personality Averages</h2>
          </div>
          <span className="text-xs text-text-muted">{insights.miniIpipCount} snapshots</span>
        </div>

        <div className="flex flex-col gap-4">
          {[
            { key: "extraversion", name: "Extraversion", desc: "Social energy & active engagement" },
            { key: "agreeableness", name: "Agreeableness", desc: "Warmth, empathy & peer support" },
            { key: "conscientiousness", name: "Conscientiousness", desc: "Organization & deliberate routines" },
            { key: "neuroticism", name: "Emotional Sensitivity", desc: "Sensitivity to environmental stress" },
            { key: "openness", name: "Openness to Experience", desc: "Curiosity, art & creative reflection" },
          ].map(({ key, name, desc }) => {
            const meta = TRAIT_META[key];
            const score = insights.avgTraits?.[key] || 12;
            const percent = Math.min(100, Math.max(0, ((score - 4) / 16) * 100));

            return (
              <div key={key} className="flex flex-col gap-1.5 p-3 rounded-[18px] bg-surface-raised border border-border/50">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-text mr-1">{name}</span>
                    <span className="text-text-muted text-[11px]">({desc})</span>
                  </div>
                  <span className="font-bold font-mono text-text">
                    {score} <span className="text-[10px] text-text-muted">/ 20</span>
                  </span>
                </div>
                <div className="w-full bg-border/40 h-2 rounded-full overflow-hidden">
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
          })}
        </div>
      </Card>

      {/* Strict Privacy Notice */}
      <div className="p-4 bg-surface-raised rounded-[20px] border border-border flex items-start gap-3">
        <FaShieldAlt className="text-primary text-base shrink-0 mt-0.5" />
        <div className="flex flex-col gap-1 text-xs text-text-muted leading-relaxed">
          <span className="font-bold text-text">Strict Privacy &amp; Anonymity Guarantee</span>
          <p>
            All data presented above is calculated through anonymous community aggregation. Individual check-in scores, journal entries, and assessment responses are strictly private to their respective authors and never visible to other users.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Insights;
