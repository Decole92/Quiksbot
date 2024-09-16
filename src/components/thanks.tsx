"use client";
import { useEffect } from "react";
import { startConfetti, stopConfetti } from "../lib/confetti"; // Import your confetti logic
import { usePathname, useSearchParams } from "next/navigation";

const ConfettiComponent = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  useEffect(() => {
    const isDashboard = pathname === "/dashboard";
    const isUpgrade = searchParams.get("upgrade") === "true";

    if (isDashboard && isUpgrade) {
      startConfetti();
    }

    return () => {
      stopConfetti();
    };
  }, [pathname, searchParams]);

  return null;
};

export default ConfettiComponent;
