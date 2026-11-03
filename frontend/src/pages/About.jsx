import React from "react";
import Card from "../components/ui/Card";
import Chip from "../components/ui/Chip";
import {
  FaFeatherAlt,
  FaShieldAlt,
  FaHeart,
  FaCalendarAlt,
  FaLock,
} from "react-icons/fa";

const About = () => {
  return (
    <div className="flex flex-col gap-6 w-full">
      <Card variant="default" className="p-6 sm:p-8 flex flex-col gap-6">
        <div className="text-center">
          <div className="w-14 h-14 rounded-[28%] bg-surface-raised ring-2 ring-border mx-auto flex items-center justify-center text-xl mb-3 text-text">
            <FaFeatherAlt />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text tracking-tight">
            About DayBook
          </h1>
          <p className="text-sm sm:text-base text-text-muted mt-2 max-w-xl mx-auto leading-relaxed">
            A calm, safe peer-support journal space to process your experiences, celebrate personal reflections, and find mental clarity.
          </p>
        </div>

        <div className="border-t border-border" />

        {/* Features */}
        <div>
          <h2 className="text-lg font-bold text-text mb-4">
            A Safe Space for Your Journey
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-surface-raised/40 rounded-[20px] border border-border flex items-start gap-3">
              <div className="w-8 h-8 rounded-[28%] bg-surface-raised text-text flex items-center justify-center shrink-0 text-sm">
                <FaLock />
              </div>
              <div>
                <h3 className="text-sm font-bold text-text">Private Reflections</h3>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">
                  Your private entries are never shared. Only you can access and read your personal journal.
                </p>
              </div>
            </div>

            <div className="p-4 bg-surface-raised/40 rounded-[20px] border border-border flex items-start gap-3">
              <div className="w-8 h-8 rounded-[28%] bg-surface-raised text-text flex items-center justify-center shrink-0 text-sm">
                <FaHeart />
              </div>
              <div>
                <h3 className="text-sm font-bold text-text">Gentle Support</h3>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">
                  A non-competitive environment without vanity follower counts or high-pressure algorithms.
                </p>
              </div>
            </div>

            <div className="p-4 bg-surface-raised/40 rounded-[20px] border border-border flex items-start gap-3">
              <div className="w-8 h-8 rounded-[28%] bg-surface-raised text-text flex items-center justify-center shrink-0 text-sm">
                <FaCalendarAlt />
              </div>
              <div>
                <h3 className="text-sm font-bold text-text">Track Your Mood</h3>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">
                  Record feelings with vibrant, accessible mood indicators to recognize patterns over time.
                </p>
              </div>
            </div>

            <div className="p-4 bg-surface-raised/40 rounded-[20px] border border-border flex items-start gap-3">
              <div className="w-8 h-8 rounded-[28%] bg-surface-raised text-text flex items-center justify-center shrink-0 text-sm">
                <FaShieldAlt />
              </div>
              <div>
                <h3 className="text-sm font-bold text-text">24/7 Crisis Helplines</h3>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">
                  Permanent access to confidential crisis and helpline support whenever you need care.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border" />

        {/* Guiding Principles */}
        <div>
          <h2 className="text-lg font-bold text-text mb-3">
            Guiding Principles
          </h2>
          <div className="flex flex-wrap gap-2">
            <Chip variant="default">Non-judgmental</Chip>
            <Chip variant="default">Privacy-first</Chip>
            <Chip variant="default">Accessible (WCAG AA)</Chip>
            <Chip variant="default">Calm Design</Chip>
            <Chip variant="default">No Toxic Positivity</Chip>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default About;
