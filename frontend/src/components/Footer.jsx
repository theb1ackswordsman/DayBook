import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="footer sm:footer-horizontal footer-center bg-base-300 text-base-content p-4 text-xs text-text-muted flex flex-wrap items-center justify-center gap-2">
      <p>
        &copy; {new Date().getFullYear()} DayBook | Student project, not a substitute for professional help.
      </p>
      <span>•</span>
      <Link to="/credits" className="hover:text-text underline">
        Credits &amp; Assets
      </Link>
    </footer>
  );
};
export default Footer;
