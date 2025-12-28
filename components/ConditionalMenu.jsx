"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Menu from "./Menu";

export default function ConditionalMenu() {
  const pathname = usePathname();
  const [shouldShow, setShouldShow] = React.useState(true);

  React.useEffect(() => {
    const checkVisibility = () => {
      const isLegalPage = pathname.includes("/legal");
      const hash = typeof window !== 'undefined' ? window.location.hash : '';
      const isSnipcartUrl =
        hash.includes("#/cart") ||
        hash.includes("#/checkout") ||
        hash.includes("#snipcart");

      setShouldShow(!isLegalPage && !isSnipcartUrl);
    };

    checkVisibility();

    // Écouter les changements de hash
    const handleHashChange = () => checkVisibility();
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [pathname]);

  if (!shouldShow) return null;
  return <Menu />;
}
