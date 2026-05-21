import Script from "next/script";
import { Suspense } from "react";
import { gaMeasurementId } from "@/lib/google-analytics";
import { GoogleAnalyticsPageView } from "./GoogleAnalyticsPageView";

/** GA4 タグ読み込み + ルート変更時の page_view 送信 */
export function GoogleAnalytics() {
  const gaId = gaMeasurementId();
  if (!gaId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}');
        `}
      </Script>
      <Suspense fallback={null}>
        <GoogleAnalyticsPageView gaId={gaId} />
      </Suspense>
    </>
  );
}
