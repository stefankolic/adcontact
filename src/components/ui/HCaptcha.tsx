"use client";

import { useEffect, useRef } from "react";
import { HCAPTCHA_SITEKEY } from "@/lib/web3forms";

// hl=en forces English regardless of the visitor's browser locale — without
// it hCaptcha auto-detects language (e.g. shows "Jag är människa" for a
// Swedish-locale browser), inconsistent with the rest of the site, which is
// English-only.
const SCRIPT_SRC = "https://js.hcaptcha.com/1/api.js?render=explicit&hl=en";

type HCaptchaApi = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  reset: (id?: string) => void;
  remove: (id?: string) => void;
};
declare global {
  interface Window {
    hcaptcha?: HCaptchaApi;
  }
}

let scriptPromise: Promise<void> | null = null;
function loadScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.hcaptcha) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = SCRIPT_SRC;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("hCaptcha failed to load"));
    document.head.appendChild(s);
  });
  return scriptPromise;
}

/**
 * hCaptcha widget using Web3Forms' shared site key. Calls `onToken` with the
 * verification token when solved, and "" on expiry/error.
 */
export default function HCaptcha({ onToken }: { onToken: (token: string) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const idRef = useRef<string | null>(null);
  const onTokenRef = useRef(onToken);
  useEffect(() => {
    onTokenRef.current = onToken;
  }, [onToken]);

  useEffect(() => {
    let removed = false;
    loadScript()
      .then(() => {
        if (removed || !containerRef.current || !window.hcaptcha || idRef.current) return;
        idRef.current = window.hcaptcha.render(containerRef.current, {
          sitekey: HCAPTCHA_SITEKEY,
          hl: "en",
          callback: (token: string) => onTokenRef.current(token),
          "expired-callback": () => onTokenRef.current(""),
          "error-callback": () => onTokenRef.current(""),
        });
      })
      .catch(() => onTokenRef.current(""));
    return () => {
      removed = true;
      if (idRef.current && window.hcaptcha) {
        try {
          window.hcaptcha.remove(idRef.current);
        } catch {
          /* widget already gone */
        }
        idRef.current = null;
      }
    };
  }, []);

  return <div ref={containerRef} className="mt-1" />;
}
