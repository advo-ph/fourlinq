import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getConsent, setConsent } from "@/lib/consent";

// Consent lives in one place so the banner (writer) and useAnalytics (reader)
// cannot drift apart — see src/lib/consent.ts (RM6).

const CookieBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (getConsent() === "unset") {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("fourlinq:cookie-visibility", { detail: { visible } }));
  }, [visible]);

  const accept = () => {
    setConsent("accepted");
    setVisible(false);
  };

  const decline = () => {
    setConsent("declined");
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          data-cookie-banner
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.68, 0, 0.33, 1] }}
          className="fixed bottom-4 left-4 right-4 lg:left-6 lg:right-auto lg:max-w-[420px] z-[52]"
          role="dialog"
          aria-label="Cookie consent"
        >
          <div className="bg-white border border-[color:var(--rule-soft)] shadow-depth-6 p-5 lg:p-6">
            <p className="text-body-sm text-[color:var(--ink-secondary)] leading-relaxed mb-4">
              We use cookies to improve your experience. By continuing to browse, you agree to our{" "}
              <Link to="/legal?page=cookies" className="text-[color:var(--ink-primary)] underline underline-offset-2 hover:text-[color:var(--accent)] transition-colors duration-300 ease-marvin">
                Cookie Policy
              </Link>.
            </p>
            <div className="flex gap-3">
              <button
                onClick={decline}
                className="flex-1 min-h-[44px] px-4 text-body-sm font-medium border border-[color:var(--rule-soft)] text-[color:var(--ink-primary)] hover:border-[color:var(--ink-primary)] transition-colors duration-300 ease-marvin"
              >
                Decline
              </button>
              <button
                onClick={accept}
                className="flex-1 min-h-[44px] px-4 text-body-sm font-medium bg-[color:var(--ink-primary)] text-white hover:bg-[color:var(--ink-secondary)] transition-colors duration-300 ease-marvin"
              >
                Accept
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieBanner;
