import React from "react";

const Footer = () => {
  return (
    <footer className="border-t border-ink/10 py-6 text-center text-sm text-ink/60">
      <span>© {new Date().getFullYear()} An-Nahj Foundation</span>
    </footer>
  );
};

export default Footer;
