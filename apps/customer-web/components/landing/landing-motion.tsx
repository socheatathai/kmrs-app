"use client";

import { useEffect } from "react";

export function LandingMotion() {
  useEffect(() => {
    const cleanUrl = () => {
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}${window.location.search}`,
      );
    };

    const scrollToSection = (hash: string) => {
      const section = document.getElementById(decodeURIComponent(hash.slice(1)));

      if (!section) return false;

      section.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        block: "start",
      });
      cleanUrl();
      return true;
    };

    const handleSectionClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest<HTMLAnchorElement>(
        'a[href^="#"]',
      );

      if (
        !link ||
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      if (scrollToSection(link.hash)) {
        event.preventDefault();
      }
    };

    document.addEventListener("click", handleSectionClick);

    if (window.location.hash) {
      requestAnimationFrame(() => {
        scrollToSection(window.location.hash);
      });
    }

    const elements = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]"),
    );

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return () => document.removeEventListener("click", handleSectionClick);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.remove("reveal-pending");
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        rootMargin: "0px 0px -10% 0px",
        threshold: 0.12,
      },
    );

    elements.forEach((element) => {
      const bounds = element.getBoundingClientRect();
      const isAlreadyVisible =
        bounds.bottom > 0 && bounds.top < window.innerHeight * 0.9;

      if (isAlreadyVisible) {
        element.classList.add("is-visible");
        return;
      }

      element.classList.add("reveal-pending");
      observer.observe(element);
    });

    return () => {
      observer.disconnect();
      document.removeEventListener("click", handleSectionClick);
    };
  }, []);

  return null;
}
