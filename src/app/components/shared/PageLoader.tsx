"use client";

import { AnimatePresence, motion } from "motion/react";

const FRAME_COUNT = 9;

export function PageLoader({ visible = true }: { visible?: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="status"
          aria-label="Loading page"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          <div className="flex flex-col items-center gap-8 px-6">
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05, duration: 0.3 }}
              className="text-center"
            >
              <p
                className="text-4xl sm:text-5xl font-black tracking-tight"
                style={{ fontFamily: "'Big Shoulders Display', sans-serif" }}
              >
                CLIP<span className="text-primary">NG</span>
              </p>
              <p className="text-xs font-mono text-muted-foreground mt-2 tracking-widest uppercase">
                Loading
                <span className="clip-loading-dots" aria-hidden="true" />
              </p>
            </motion.div>

            <div className="relative w-full max-w-xs">
              <div className="clip-film-strip rounded-lg border border-border bg-card p-3 overflow-hidden">
                <div className="flex justify-between gap-1 mb-1.5 px-0.5">
                  {Array.from({ length: FRAME_COUNT }).map((_, i) => (
                    <span key={`top-${i}`} className="clip-sprocket" />
                  ))}
                </div>
                <div className="flex items-end justify-between gap-1 h-10 relative">
                  {Array.from({ length: FRAME_COUNT }).map((_, i) => (
                    <span
                      key={i}
                      className="clip-frame-bar flex-1 rounded-sm bg-primary/20 origin-bottom"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    />
                  ))}
                  <span className="clip-scan-line" aria-hidden="true" />
                </div>
                <div className="flex justify-between gap-1 mt-1.5 px-0.5">
                  {Array.from({ length: FRAME_COUNT }).map((_, i) => (
                    <span key={`bot-${i}`} className="clip-sprocket" />
                  ))}
                </div>
              </div>

              <div className="mt-4 h-0.5 w-full rounded-full bg-secondary overflow-hidden">
                <span className="clip-progress-sweep block h-full w-1/3 rounded-full bg-gradient-to-r from-primary via-primary to-accent" />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
