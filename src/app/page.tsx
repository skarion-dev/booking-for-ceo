"use client";

import { motion, type Transition } from "framer-motion";
import Image from "next/image";
import { PublicBookingPage } from "@/components/booking/public-booking-page";

// ─── Animation Helpers ─────────────────────────────────────────────────────────
const EASE = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" } as const,
  transition: { duration: 0.75, ease: EASE } as Transition,
};

const stagger = (i: number) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true } as const,
  transition: { duration: 0.6, ease: EASE, delay: i * 0.1 } as Transition,
});

// ─── Icons ─────────────────────────────────────────────────────────────────────
function LinkedinIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

// ─── Data ──────────────────────────────────────────────────────────────────────
const stats = [
  { value: "5+", label: "Years Engineering & Leadership" },
  { value: "300+", label: "Consultation Calls Taken" },
  { value: "100+", label: "Technical Professionals Trained" },
  { value: "70+", label: "People Placed" },
];


// ─── Section Badge Component ────────────────────────────────────────────────────
function SectionBadge({ label }: { label: string }) {
  return (
    <span className="section-badge">
      <span className="text-neutral-400 font-mono">{label}</span>
    </span>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FAF9F6] dark:bg-[#050508]">

      {/* ═══════════════════════════════════════════════════════════════════════
          BOOKING SECTION  (top of page — before hero)
      ═══════════════════════════════════════════════════════════════════════ */}
      <section
        id="booking"
        className="pt-[68px] px-4 sm:px-6 border-b border-neutral-200 dark:border-neutral-800 bg-[#FAF9F6] dark:bg-[#050508]"
      >
        <div className="max-w-7xl mx-auto w-full py-16 lg:py-20">
          <motion.div {...fadeUp} className="text-center mb-10">
            <SectionBadge label="LET'S GET YOU A JOB" />
            <h2 className="mt-4 text-[2rem] sm:text-[2.5rem] lg:text-[3rem] font-bold tracking-[-0.035em] leading-[1.1] text-neutral-900 dark:text-neutral-50 mb-4">
              Book a Consultation
            </h2>
            <p className="text-[1.0625rem] text-neutral-500 dark:text-neutral-400 max-w-xl mx-auto leading-relaxed">
              Ready to land a job in your desired field? Book a session to discuss your career goals, review your résumé, and start your journey.
            </p>
          </motion.div>

          {/* Booking widget — full width, no card border */}
          <div className="w-full skarion-theme booking-no-border">
            <PublicBookingPage />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════════════════════════════════════ */}
      <section
        id="home"
        className="relative px-6 overflow-hidden"
      >
        <div className="max-w-7xl mx-auto w-full py-20 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-15 items-center">

            {/* ── Left: Content (7 cols) ── */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
              className="lg:col-span-7 flex flex-col gap-7 order-2 lg:order-1"
            >
              {/* Sub-role badge */}
              <div className="inline-flex items-center gap-2 w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                <span className="text-[11px] font-semibold tracking-[0.14em] uppercase text-neutral-500 dark:text-neutral-400">
                  Founder & Engineering Leader
                </span>
              </div>

              {/* H1 */}
              <h1 className="text-[2.75rem] sm:text-5xl lg:text-[3.5rem] xl:text-[4rem] font-bold tracking-[-0.03em] leading-[1.08] text-neutral-900 dark:text-neutral-50">
                Hi, I&apos;m Saki.<br/>
                I empower the next generation of engineering talent.
              </h1>

              {/* Subtext */}
              <p className="text-[1.0625rem] text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-xl">
                Founder &amp; CEO at SKARION and Director of Engineering at SKARION Engineering. I help individuals confidently navigate the hiring process and secure top-tier roles through expert coaching, resume optimization, and hands-on training.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-5 mt-1">
                <a
                  href="#booking"
                  id="hero-cta-book"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="btn-dark-pill"
                >
                  Book a Consultation
                </a>
                <a
                  href="https://www.skarion.com"
                  id="hero-cta-skarion"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-border-pill"
                >
                  Explore Skarion
                </a>
              </div>
            </motion.div>

            {/* ── Right: Portrait Image (5 cols) ── */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
              className="lg:col-span-5 order-1 lg:order-2 flex justify-center lg:justify-end"
            >
              <div className="relative w-full max-w-[380px] lg:max-w-none aspect-[4/5] rounded-3xl overflow-hidden image-glow">
                <Image
                  src="https://media.licdn.com/dms/image/v2/D4E03AQFsfQG8oD4rtg/profile-displayphoto-shrink_800_800/B4EZbSV3QzHkAg-/0/1747285670261?e=1785974400&v=beta&t=1TN3-q24J1zT320TyUI15LPzxbRxplF40oQZfebGFfE"
                  alt="Abdullah Al Saki — Founder & CEO at SKARION"
                  fill
                  sizes="(max-width: 768px) 380px, (max-width: 1280px) 40vw, 500px"
                  className="object-cover object-top"
                  priority
                />
                {/* Subtle overlay gradient at bottom */}
                <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-neutral-900/20 to-transparent pointer-events-none" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          (01) ABOUT SECTION
      ═══════════════════════════════════════════════════════════════════════ */}
      <section id="about" className="pt-28 pb-34 px-6 border-t border-neutral-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto w-full">

          {/* Section badge */}
          <motion.div {...fadeUp} className="mb-14">
            <SectionBadge label="ABOUT SKARION" />
          </motion.div>

          {/* 2-col split */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Left: Bold sub-headline */}
            <motion.div {...fadeUp}>
              <h2 className="text-[1.875rem] sm:text-[2.25rem] lg:text-[2.5rem] font-bold tracking-[-0.025em] leading-[1.15] text-neutral-900 dark:text-neutral-50">
                Empowering professionals to position themselves, build skills, and move forward in their careers.
              </h2>
            </motion.div>

            {/* Right: Story copy */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" } as const}
              transition={{ duration: 0.75, ease: EASE, delay: 0.12 } as Transition}
              className="flex flex-col gap-5"
            >
              <p className="text-[1.0625rem] text-neutral-500 dark:text-neutral-400 leading-relaxed">
                At Skarion, our mission is to make high-quality career training and job placement accessible to everyone. We combine expert-led bootcamps, personalized mentoring, and hands-on placement support of operating on a success-based model that only wins when our students do.
              </p>
              <p className="text-[1.0625rem] text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Skarion is the only career platform that trains you with real-world skills, applies to jobs on your behalf, and operates on a “pay-when-hired” model regardless of your background, degree, or immigration status. 
              </p>
            </motion.div>
          </div>

          {/* ── Stats Grid ── */}
          <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                {...stagger(i)}
                className="stat-card"
              >
                <p className="text-[2rem] lg:text-[2.5rem] font-bold tracking-[-0.04em] text-neutral-900 dark:text-neutral-50 mb-1.5">
                  {stat.value}
                </p>
                <p className="text-[0.8125rem] text-neutral-500 dark:text-neutral-400 leading-snug">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="px-6 py-10 border-t border-neutral-200 dark:border-neutral-800 bg-[#FAF9F6] dark:bg-[#050508]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-5">
          <p className="text-[0.8125rem] text-neutral-400 dark:text-neutral-500">
            © {new Date().getFullYear()} SKARION. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a
              href="https://www.linkedin.com/in/alsaki"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[0.8125rem] font-medium text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors inline-flex items-center gap-1.5"
            >
              <LinkedinIcon size={13} />
              Abdullah Al Saki
            </a>
            <a
              href="https://www.linkedin.com/company/skarion/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[0.8125rem] font-medium text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
            >
              Skarion LinkedIn
            </a>
            <a
              href="https://www.skarion.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[0.8125rem] font-medium text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
            >
              skarion.com 
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
