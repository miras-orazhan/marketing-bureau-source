import Script from 'next/script'

type AnalyticsScriptsProps = {
  /** Google Tag Manager ID (например, GTM-TPQ89ZS5) */
  gtmId?: string | null
  /** Google Analytics ID (например, G-XXXXXXXXXX или UA-XXXXXX-X) */
  gaId?: string | null
  /** Yandex.Metrika ID (число) */
  yandexMetrikaId?: string | null
}

/**
 * Аналитика: GTM, Google Analytics, Yandex.Metrika.
 *
 * ВСЕ скрипты загружаются с strategy="lazyOnload" — это значит:
 *   - браузер НЕ блокирует рендеринг страницы ради аналитики
 *   - скрипты грузятся в idle-время, после полной отрисовки контента
 *   - LCP / FCP / TBT существенно лучше
 *
 * Если нужна ранняя аналитика (например, отслеживать немедленный bounce-rate),
 * можно вернуть strategy="afterInteractive" — но это ударит по LCP.
 *
 * GTM подключается двумя частями (по инструкции Google):
 * 1. <Script> в <head> — основной скрипт
 * 2. <noscript> с <iframe> — рендерится ПЕРВЫМ внутри <body>, сразу после открывающего тега.
 *
 * Google Analytics и Yandex.Metrika рендерятся только если GTM не подключён
 * (GTM обычно управляет ими через теги внутри своего контейнера).
 */
export function AnalyticsHead({ gtmId, gaId, yandexMetrikaId }: AnalyticsScriptsProps) {
  // GTM head-скрипт
  if (gtmId) {
    return (
      <Script id="gtm-head" strategy="lazyOnload">
        {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`}
      </Script>
    )
  }

  // Если GTM нет — подключаем GA и Yandex.Metrika напрямую
  const scripts: React.ReactNode[] = []

  if (gaId) {
    scripts.push(
      <Script
        key="ga-src"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="lazyOnload"
      />,
      <Script key="ga-init" id="ga-init" strategy="lazyOnload">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaId}');`}
      </Script>
    )
  }

  if (yandexMetrikaId) {
    scripts.push(
      <Script key="ym" id="yandex-metrika" strategy="lazyOnload">
        {`(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
m[i].l=1*new Date();
for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

ym(${yandexMetrikaId}, "init", {
  clickmap:true,
  trackLinks:true,
  accurateTrackBounce:true,
  webvisor:true,
  defer:true
});`}
      </Script>
    )
  }

  return <>{scripts}</>
}

/**
 * <noscript> часть GTM — рендерится сразу после <body>.
 * Используется только если задан gtmId.
 */
export function AnalyticsNoScript({ gtmId }: { gtmId?: string | null }) {
  if (!gtmId) return null
  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
        height="0"
        width="0"
        style={{ display: 'none', visibility: 'hidden' }}
      />
    </noscript>
  )
}
