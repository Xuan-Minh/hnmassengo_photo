"use client";
import Script from "next/script";

export default function SnipcartPortal() {
  return (
    <>
      <div
        id="snipcart"
        data-api-key="MzhiNjU4MDUtYTA2MC00YjA5LTkwYmMtOWIyY2FjOTAyZmZlNjM4OTk4OTA5MTYxNDMxODU0"
        data-config-add-product-behavior="none"
        hidden
        suppressHydrationWarning
      ></div>
      <Script
        src="https://cdn.snipcart.com/themes/v3.0.31/default/snipcart.js"
        strategy="afterInteractive"
        suppressHydrationWarning
      />
    </>
  );
}
