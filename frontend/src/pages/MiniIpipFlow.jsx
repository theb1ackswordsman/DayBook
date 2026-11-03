import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useCreateCheckInMutation } from "../redux/api/checkInsApiSlice";
import {
  MINI_IPIP_ITEMS,
  MINI_IPIP_SCALE,
  MINI_IPIP_PROMPT,
  TRAIT_META,
  getTraitInterpretation,
} from "../config/miniIpipData";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { toast } from "react-toastify";
import {
  FaBrain,
  FaArrowLeft,
  FaArrowRight,
  FaTimes,
  FaCheck,
  FaInfoCircle,
  FaRedo,
  FaShieldAlt,
} from "react-icons/fa";

const MiniIpipFlow = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const [createCheckIn, { isLoading: isSubmitting }] = useCreateCheckInMutation();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState(new Array(20).fill(null));
  const [saveToHistory, setSaveToHistory] = useState(true);

  // Completed results state
  const [result, setResult] = useState(null);

  const currentItem = MINI_IPIP_ITEMS[currentIndex];
  const currentAnswer = answers[currentIndex];
  const progressPercent = ((currentIndex + 1) / MINI_IPIP_ITEMS.length) * 100;
  const answeredCount = answers.filter((a) => a !== null).length;

  // Handle option select
  const handleSelectOption = (value) => {
    const updated = [...answers];
    updated[currentIndex] = value;
    setAnswers(updated);
  };

  // Keyboard navigation (1-5 keys)
  useEffect(() => {
    if (result) return;
    const handleKeyDown = (e) => {
      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= 5) {
        handleSelectOption(num);
      } else if (e.key === "Enter" && currentAnswer !== null) {
        handleNext();
      } else if (e.key === "ArrowRight" && currentAnswer !== null) {
        handleNext();
      } else if (e.key === "ArrowLeft" && currentIndex > 0) {
        handleBack();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, currentAnswer, answers, result]);

  const handleNext = () => {
    if (currentIndex < MINI_IPIP_ITEMS.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSkipQuestion = () => {
    if (answers[currentIndex] === null) {
      const updated = [...answers];
      updated[currentIndex] = 3; // neutral midpoint (Neither Inaccurate nor Accurate)
      setAnswers(updated);
    }
    if (currentIndex < MINI_IPIP_ITEMS.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    // Fill any skipped answers with neutral midpoint 3
    const finalAnswers = answers.map((a) => (a !== null ? a : 3));

    try {
      const res = await createCheckIn({
        type: "mini_ipip",
        answers: finalAnswers,
        saveToHistory: Boolean(user && saveToHistory),
      }).unwrap();

      setResult(res.data);
      toast.success(res.message || "Personality snapshot completed!");

      // Dispatch pet reaction on completion
      try {
        window.dispatchEvent(
          new CustomEvent("daybook:entry-saved", {
            detail: { type: "personality_snapshot" },
          })
        );
      } catch (e) {
        // Safe fallback if window event isn't supported
      }
    } catch (err) {
      if (err.status === 409 && err.data?.data) {
        setResult(err.data.data);
        toast.info(err.data.message);
      } else {
        toast.error(err.data?.message || "Failed to submit assessment.");
      }
    }
  };

  const handleRetake = () => {
    setAnswers(new Array(20).fill(null));
    setCurrentIndex(0);
    setResult(null);
  };

  // --- RESULTS VIEW ---
  if (result) {
    const traits = result.traits || {};
    const traitKeys = [
      "extraversion",
      "agreeableness",
      "conscientiousness",
      "neuroticism",
      "openness",
    ];

    return (
      <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto pb-12 animate-in fade-in duration-300">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaBrain className="text-primary text-base" />
            <span className="font-bold text-sm text-text">Personality Snapshot</span>
          </div>
          <Link
            to="/check-in"
            className="text-xs text-text-muted hover:text-text font-medium"
          >
            &larr; Check-in Hub
          </Link>
        </header>

        <Card variant="default" className="p-6 sm:p-8 flex flex-col gap-6">
          <div className="text-center flex flex-col items-center gap-1">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary-soft text-primary-dark">
              Big Five Dimensions
            </span>
            <h1 className="text-2xl font-bold text-text">Your Personality Snapshot</h1>
            <p className="text-xs text-text-muted max-w-md mt-1 leading-relaxed">
              Based on the 20-item Mini-IPIP framework. Scores range from 4 (lowest) to 20 (highest) across each trait.
            </p>
          </div>

          {/* 5 Trait Bars */}
          <div className="flex flex-col gap-5 pt-2">
            {traitKeys.map((key) => {
              const meta = TRAIT_META[key];
              const score = traits[key] ?? 12; // default midpoint if undefined
              // Map score 4..20 to 0%..100%
              const percent = Math.min(100, Math.max(0, ((score - 4) / 16) * 100));
              const interpretation = getTraitInterpretation(key, score);

              return (
                <div
                  key={key}
                  className="p-4 rounded-[20px] bg-surface-raised border border-border/70 flex flex-col gap-2.5 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-text">{meta.name}</span>
                        <span className="text-[11px] text-text-muted">({meta.tagline})</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <span className="text-text">{score}</span>
                      <span className="text-text-muted text-[10px]">/ 20</span>
                    </div>
                  </div>

                  {/* Horizontal Bar */}
                  <div className="w-full bg-border/40 h-2.5 rounded-full overflow-hidden relative">
                    <div
                      className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: `${percent}%`,
                        backgroundColor: meta.color,
                      }}
                    />
                  </div>

                  {/* Friendly "tends toward..." wording */}
                  <p className="text-xs text-text-muted leading-relaxed italic">
                    &ldquo;{interpretation}&rdquo;
                  </p>
                </div>
              );
            })}
          </div>

          {/* Calming Non-diagnostic Disclaimer */}
          <div className="p-4 bg-surface-raised rounded-[18px] border border-border flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
            <FaInfoCircle className="text-primary shrink-0 text-base" />
            <div className="text-xs text-text-muted leading-relaxed">
              <span className="font-semibold text-text">
                Personality is nuanced; this is a short, fun snapshot.
              </span>{" "}
              These scores reflect broad behavioral tendencies, not fixed limits or clinical categories.
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetake}
              className="w-full sm:w-auto"
            >
              <FaRedo className="text-xs mr-1" /> Retake Snapshot
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate("/check-in")}
              className="w-full sm:w-auto"
            >
              Back to Check-in Hub &rarr;
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // --- QUESTION FLOW VIEW ---
  return (
    <div className="flex flex-col gap-6 w-full max-w-xl mx-auto pb-12 animate-in fade-in duration-300">
      {/* Flow Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FaBrain className="text-primary text-base" />
          <span className="font-bold text-sm text-text">Personality Snapshot</span>
          <span className="text-[11px] text-text-muted">Mini-IPIP</span>
        </div>
        <button
          type="button"
          onClick={() => navigate("/check-in")}
          className="text-text-muted hover:text-text p-1 text-sm rounded-full hover:bg-surface-raised cursor-pointer transition-colors"
          title="Exit to Check-in Hub"
        >
          <FaTimes />
        </button>
      </header>

      {/* Progress Bar */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-[11px] text-text-muted font-medium">
          <span>
            Question {currentIndex + 1} of {MINI_IPIP_ITEMS.length}
          </span>
          <span>{answeredCount} answered</span>
        </div>
        <div className="w-full bg-surface-raised h-2 rounded-full overflow-hidden border border-border/40">
          <div
            className="bg-primary h-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <Card variant="default" className="p-6 sm:p-8 flex flex-col gap-6">
        <div>
          <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
            Statement {currentItem.id}
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-text mt-2 leading-relaxed">
            &ldquo;{currentItem.text}&rdquo;
          </h2>
          <p className="text-[11px] text-text-muted mt-2 italic">
            Describe yourself as you generally are now, in relation to people around you.
          </p>
        </div>

        {/* 5-Point Scale Options */}
        <div className="flex flex-col gap-2.5">
          {MINI_IPIP_SCALE.map((opt) => {
            const isSelected = currentAnswer === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleSelectOption(opt.value)}
                className={`flex items-center justify-between p-3.5 rounded-[18px] border text-left transition-all cursor-pointer ${
                  isSelected
                    ? "bg-primary-soft/40 border-primary shadow-sm"
                    : "bg-surface border-border hover:bg-surface-raised hover:border-border/80"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 border ${
                      isSelected
                        ? "bg-primary text-white border-primary"
                        : "bg-surface-raised text-text-muted border-border"
                    }`}
                  >
                    {opt.value}
                  </span>
                  <span
                    className={`text-xs font-medium ${
                      isSelected ? "text-text font-bold" : "text-text"
                    }`}
                  >
                    {opt.label}
                  </span>
                </div>
                {isSelected && <FaCheck className="text-primary text-xs shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Save to History Option (logged-in users) */}
        {user && (
          <label className="flex items-center gap-2 text-xs text-text-muted cursor-pointer pt-2 border-t border-border/60">
            <input
              type="checkbox"
              checked={saveToHistory}
              onChange={(e) => setSaveToHistory(e.target.checked)}
              className="rounded border-border text-primary focus:ring-primary"
            />
            <span className="flex items-center gap-1">
              <FaShieldAlt className="text-[11px]" />
              Save score to my private reflection history (1/day)
            </span>
          </label>
        )}

        {/* Navigation & Skip */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBack}
              disabled={currentIndex === 0}
            >
              <FaArrowLeft className="text-xs mr-1" /> Back
            </Button>
            <button
              type="button"
              onClick={handleSkipQuestion}
              className="text-xs text-text-muted hover:text-text font-medium px-2 py-1 cursor-pointer"
            >
              Skip
            </button>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={handleNext}
            disabled={currentAnswer === null || isSubmitting}
          >
            {currentIndex === MINI_IPIP_ITEMS.length - 1 ? (
              isSubmitting ? "Calculating..." : "See Results"
            ) : (
              <>
                Next <FaArrowRight className="text-xs ml-1" />
              </>
            )}
          </Button>
        </div>

        {/* Keyboard Hint */}
        <div className="text-[10px] text-text-muted text-center pt-1 border-t border-border/40">
          Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-surface-raised border border-border text-text font-mono">1</kbd> to <kbd className="px-1.5 py-0.5 rounded bg-surface-raised border border-border text-text font-mono">5</kbd> on your keyboard to choose, and <kbd className="px-1.5 py-0.5 rounded bg-surface-raised border border-border text-text font-mono">Enter</kbd> to continue.
        </div>
      </Card>
    </div>
  );
};

export default MiniIpipFlow;
