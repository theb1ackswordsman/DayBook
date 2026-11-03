import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useCreateCheckInMutation } from "../redux/api/checkInsApiSlice";
import {
  WHO5_ITEMS,
  WHO5_SCALE,
  WHO5_PROMPT,
} from "../config/who5Data";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import HelpModal from "../components/navbar/HelpModal";
import { toast } from "react-toastify";
import {
  FaHeartbeat,
  FaArrowLeft,
  FaArrowRight,
  FaTimes,
  FaCheck,
  FaInfoCircle,
  FaHandsHelping,
  FaShieldAlt,
} from "react-icons/fa";

const Who5Flow = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const [createCheckIn, { isLoading: isSubmitting }] = useCreateCheckInMutation();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([null, null, null, null, null]);
  const [saveToHistory, setSaveToHistory] = useState(true);

  // Completed results state
  const [result, setResult] = useState(null);
  const [helpModalOpen, setHelpModalOpen] = useState(false);

  const currentItem = WHO5_ITEMS[currentIndex];
  const currentAnswer = answers[currentIndex];
  const progressPercent = ((currentIndex + 1) / WHO5_ITEMS.length) * 100;

  // Handle option select
  const handleSelectOption = (value) => {
    const updated = [...answers];
    updated[currentIndex] = value;
    setAnswers(updated);
  };

  // Keyboard navigation (0-5 keys)
  useEffect(() => {
    if (result) return;
    const handleKeyDown = (e) => {
      const num = parseInt(e.key, 10);
      if (num >= 0 && num <= 5) {
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
    if (currentIndex < WHO5_ITEMS.length - 1) {
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
    // If skipped, default to middle value 2 (less than half of the time) or previous
    if (answers[currentIndex] === null) {
      const updated = [...answers];
      updated[currentIndex] = 2; // neutral midpoint
      setAnswers(updated);
    }
    if (currentIndex < WHO5_ITEMS.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    // Replace any remaining unselected with 2 (neutral)
    const finalAnswers = answers.map((a) => (a !== null ? a : 2));

    try {
      const res = await createCheckIn({
        type: "who5",
        answers: finalAnswers,
        saveToHistory: Boolean(user && saveToHistory),
      }).unwrap();

      setResult(res.data);
      toast.success(res.message || "Check-in completed!");
    } catch (err) {
      // If 409 daily limit reached, still display calculated score
      if (err.status === 409 && err.data?.data) {
        setResult(err.data.data);
        toast.info(err.data.message);
      } else {
        toast.error(err.data?.message || "Failed to submit check-in.");
      }
    }
  };

  // --- RESULTS VIEW ---
  if (result) {
    const { score, rawScore, band, flaggedLow } = result;

    // Color tones (calm, never alarming red)
    let gaugeColor = "text-primary";
    let badgeBg = "bg-primary-soft text-primary-dark";
    if (band === "Low well-being") {
      gaugeColor = "text-accent"; // warm amber/coral, not harsh red
      badgeBg = "bg-accent/15 text-accent-dark";
    } else if (band === "Moderate well-being") {
      gaugeColor = "text-sky-500";
      badgeBg = "bg-sky-50 text-sky-800";
    }

    return (
      <div className="flex flex-col gap-6 w-full max-w-xl mx-auto pb-12 animate-in fade-in duration-300">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaHeartbeat className="text-primary text-base" />
            <span className="font-bold text-sm text-text">Wellbeing Reflection</span>
          </div>
          <Link
            to="/check-in"
            className="text-xs text-text-muted hover:text-text font-medium"
          >
            &larr; Check-in Hub
          </Link>
        </header>

        <Card variant="default" className="p-6 flex flex-col items-center text-center gap-5">
          {/* Calm Visual Gauge */}
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                className="text-surface-raised stroke-current"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                className={`${gaugeColor} stroke-current transition-all duration-1000 ease-out`}
                strokeWidth="8"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 - (251.2 * score) / 100}
                strokeLinecap="round"
                fill="none"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-extrabold text-text">{score}</span>
              <span className="text-[10px] text-text-muted uppercase font-bold">
                out of 100
              </span>
            </div>
          </div>

          <div>
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${badgeBg} mb-2`}
            >
              {band}
            </span>
            <p className="text-xs text-text-muted max-w-sm mx-auto leading-relaxed">
              Based on your reflection over the past two weeks (Raw score: {rawScore}/25).
            </p>
          </div>

          {/* Mandatory Medical Disclaimer */}
          <div className="p-3 bg-surface-raised rounded-[16px] border border-border w-full flex items-center justify-center gap-2 text-xs text-text-muted">
            <FaInfoCircle className="text-primary shrink-0" />
            <span className="font-medium italic">
              This is a check-in, not a diagnosis.
            </span>
          </div>

          {/* Gentle Support Card if flagged low (raw < 13) */}
          {flaggedLow && (
            <div className="w-full p-4 bg-accent/10 border border-accent/30 rounded-[20px] text-left flex flex-col gap-2.5">
              <div className="flex items-center gap-2 text-accent font-bold text-xs">
                <FaHandsHelping className="text-sm" />
                <span>Support & Resources</span>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                Your answers suggest your emotional well-being has been lower recently.
                Consider sharing how you feel with someone you trust or a healthcare professional.
                You don't have to carry things alone.
              </p>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setHelpModalOpen(true)}
                  className="px-3.5 py-1.5 bg-accent text-white text-xs font-bold rounded-full hover:opacity-90 transition-opacity cursor-pointer"
                >
                  View Help &amp; Helplines
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 w-full pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setResult(null);
                setCurrentIndex(0);
                setAnswers([null, null, null, null, null]);
              }}
              className="flex-1"
            >
              Retake Check-in
            </Button>
            <Button
              variant="primary"
              onClick={() => navigate("/check-in")}
              className="flex-1"
            >
              Done &rarr; Hub
            </Button>
          </div>
        </Card>

        <HelpModal
          isOpen={helpModalOpen}
          onClose={() => setHelpModalOpen(false)}
        />
      </div>
    );
  }

  // --- QUESTION STEP FLOW ---
  return (
    <div className="flex flex-col gap-6 w-full max-w-xl mx-auto pb-12">
      {/* Top Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FaHeartbeat className="text-primary text-base" />
          <h1 className="font-bold text-sm text-text">WHO-5 Wellbeing Check</h1>
        </div>
        <button
          type="button"
          onClick={() => navigate("/check-in")}
          className="text-xs text-text-muted hover:text-text font-medium flex items-center gap-1 cursor-pointer"
        >
          <FaTimes className="text-[10px]" /> Exit
        </button>
      </header>

      {/* Progress Bar */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between text-[11px] font-semibold text-text-muted">
          <span>
            Question {currentIndex + 1} of {WHO5_ITEMS.length}
          </span>
          <span>{Math.round(progressPercent)}%</span>
        </div>
        <div className="w-full h-1.5 bg-surface-raised rounded-full overflow-hidden border border-border/50">
          <div
            className="h-full bg-primary transition-all duration-300 ease-out rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <Card variant="default" className="p-6 sm:p-8 flex flex-col gap-6 select-none shadow-sm">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted block mb-1">
            Over the last two weeks...
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-text leading-snug">
            "{currentItem.text}"
          </h2>
        </div>

        {/* 0-5 Options */}
        <div
          role="radiogroup"
          aria-label={currentItem.text}
          className="flex flex-col gap-2.5"
        >
          {WHO5_SCALE.map((opt) => {
            const isSelected = currentAnswer === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => handleSelectOption(opt.value)}
                className={`flex items-center justify-between p-3.5 rounded-[18px] border transition-all text-left cursor-pointer ${
                  isSelected
                    ? "border-primary bg-primary-soft text-text ring-1 ring-primary"
                    : "border-border bg-surface hover:bg-surface-raised/60 text-text-muted hover:text-text"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      isSelected
                        ? "bg-primary text-white"
                        : "bg-surface-raised text-text-muted"
                    }`}
                  >
                    {opt.value}
                  </span>
                  <div>
                    <p className={`text-xs font-bold ${isSelected ? "text-primary" : "text-text"}`}>
                      {opt.label}
                    </p>
                    <p className="text-[10px] text-text-muted">{opt.description}</p>
                  </div>
                </div>
                {isSelected && <FaCheck className="text-primary text-xs shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Save to History Preference (Only on last question) */}
        {currentIndex === WHO5_ITEMS.length - 1 && user && (
          <label className="flex items-center gap-2 text-xs text-text-muted cursor-pointer pt-2 border-t border-border">
            <input
              type="checkbox"
              checked={saveToHistory}
              onChange={(e) => setSaveToHistory(e.target.checked)}
              className="rounded text-primary focus:ring-primary h-3.5 w-3.5"
            />
            <span>Save result to my private check-in history</span>
          </label>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <button
            type="button"
            disabled={currentIndex === 0}
            onClick={handleBack}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-text-muted hover:text-text disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            <FaArrowLeft className="text-[10px]" /> Back
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSkipQuestion}
              className="px-3 py-1.5 text-xs font-semibold text-text-muted hover:text-text cursor-pointer"
            >
              Skip
            </button>
            <Button
              variant="primary"
              disabled={isSubmitting}
              onClick={handleNext}
              className="flex items-center gap-1.5"
            >
              <span>{currentIndex === WHO5_ITEMS.length - 1 ? "Complete" : "Next"}</span>
              <FaArrowRight className="text-[10px]" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Who5Flow;
