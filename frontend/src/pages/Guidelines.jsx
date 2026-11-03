import React from "react";
import Card from "../components/ui/Card";
import { FaShieldAlt, FaHeart, FaFlag, FaHandshake } from "react-icons/fa";

const Guidelines = () => {
  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto pb-8">
      <header className="flex items-center gap-3 p-2 px-4 bg-surface rounded-full border border-border">
        <FaShieldAlt className="text-primary-dark text-sm" />
        <h1 className="font-bold text-sm text-text">Community Guidelines</h1>
      </header>

      <Card variant="default" className="p-6 flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-bold text-text mb-2">
            Welcome to DayBook
          </h2>
          <p className="text-sm text-text-muted leading-relaxed">
            DayBook is a quiet, supportive space for sharing thoughts and
            feelings. These guidelines help keep our community safe and kind.
          </p>
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary-soft text-primary-dark flex items-center justify-center shrink-0 mt-0.5">
              <FaHeart className="text-xs" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text mb-1">Be kind and supportive</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Treat others the way you'd like to be treated. Offer
                encouragement, not judgment. Everyone here is on their own journey.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary-soft text-primary-dark flex items-center justify-center shrink-0 mt-0.5">
              <FaHandshake className="text-xs" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text mb-1">Respect privacy</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Don't share others' personal information. What people share here
                stays here. Never screenshot or repost someone's content without
                their permission.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary-soft text-primary-dark flex items-center justify-center shrink-0 mt-0.5">
              <FaFlag className="text-xs" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text mb-1">Report harmful content</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                If you see something that makes you uncomfortable or could harm
                someone, use the report button on the post. We review all
                reports carefully.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary-soft text-primary-dark flex items-center justify-center shrink-0 mt-0.5">
              <FaShieldAlt className="text-xs" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text mb-1">Not allowed</h3>
              <ul className="text-xs text-text-muted leading-relaxed list-disc pl-4 space-y-1">
                <li>Harassment, bullying, or personal attacks</li>
                <li>Hate speech or discrimination</li>
                <li>Spam, self-promotion, or advertising</li>
                <li>Explicit or violent content</li>
                <li>Encouraging self-harm or dangerous behavior</li>
                <li>Impersonation of others</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <p className="text-xs text-text-muted leading-relaxed text-center">
            Student project, not a substitute for professional help.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Guidelines;
