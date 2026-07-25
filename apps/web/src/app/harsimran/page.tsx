'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState, type CSSProperties } from 'react';

import styles from './apology.module.css';

const floatingBits = [
  { glyph: '✦', left: '7%', top: '18%', delay: '0s', duration: '8s', size: '1.1rem' },
  { glyph: '♡', left: '14%', top: '72%', delay: '-2s', duration: '10s', size: '1.5rem' },
  { glyph: '✧', left: '27%', top: '11%', delay: '-4s', duration: '7s', size: '0.9rem' },
  { glyph: '🌷', left: '82%', top: '16%', delay: '-1s', duration: '11s', size: '1.5rem' },
  { glyph: '♡', left: '89%', top: '68%', delay: '-5s', duration: '9s', size: '1.2rem' },
  { glyph: '✦', left: '72%', top: '82%', delay: '-3s', duration: '8s', size: '1rem' },
  { glyph: '✧', left: '94%', top: '36%', delay: '-6s', duration: '12s', size: '0.8rem' },
  { glyph: '♡', left: '4%', top: '44%', delay: '-7s', duration: '10s', size: '1rem' },
];

const sparkles = Array.from({ length: 26 }, (_, index) => ({
  left: `${(index * 37) % 101}%`,
  top: `${(index * 53) % 97}%`,
  delay: `${-((index * 0.37) % 6)}s`,
  duration: `${3.2 + ((index * 0.41) % 4)}s`,
  scale: `${0.45 + ((index * 0.17) % 0.9)}`,
}));

export default function HarsimranApologyPage() {
  const [opened, setOpened] = useState(false);
  const [flowerOpened, setFlowerOpened] = useState(false);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <main id="content" className={styles.stage}>
      <div className={styles.aurora} aria-hidden="true" />
      <div className={styles.mesh} aria-hidden="true" />
      <div className={styles.vignette} aria-hidden="true" />
      <div className={styles.orbitOne} aria-hidden="true" />
      <div className={styles.orbitTwo} aria-hidden="true" />

      <div className={styles.sparkleField} aria-hidden="true">
        {sparkles.map((sparkle, index) => (
          <span
            key={index}
            className={styles.sparkle}
            style={
              {
                '--left': sparkle.left,
                '--top': sparkle.top,
                '--delay': sparkle.delay,
                '--duration': sparkle.duration,
                '--scale': sparkle.scale,
              } as CSSProperties
            }
          />
        ))}
      </div>

      <div aria-hidden="true">
        {floatingBits.map((bit) => (
          <span
            key={`${bit.glyph}-${bit.left}`}
            className={styles.floatingBit}
            style={
              {
                '--left': bit.left,
                '--top': bit.top,
                '--delay': bit.delay,
                '--duration': bit.duration,
                '--size': bit.size,
              } as CSSProperties
            }
          >
            {bit.glyph}
          </span>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {!opened ? (
          <motion.section
            key="intro"
            className={styles.intro}
            initial={{ opacity: 0, scale: 0.96, filter: 'blur(12px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.06, filter: 'blur(14px)' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div
              className={styles.moon}
              animate={{ y: [0, -10, 0], rotate: [0, 2, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              aria-hidden="true"
            >
              <span>🌙</span>
            </motion.div>

            <p className={styles.eyebrow}>A small corner of the internet, made only for you</p>
            <h1 className={styles.introTitle}>
              Harsimran,
              <span>I need to tell you something.</span>
            </h1>
            <p className={styles.introCopy}>No excuses. No clever defence. Just the truth.</p>

            <motion.button
              type="button"
              className={styles.openButton}
              onClick={() => setOpened(true)}
              whileHover={{ scale: 1.035 }}
              whileTap={{ scale: 0.97 }}
            >
              <span>Open my apology</span>
              <span aria-hidden="true">✦</span>
            </motion.button>
          </motion.section>
        ) : (
          <motion.section
            key="apology"
            className={styles.apologyShell}
            initial={{ opacity: 0, scale: 0.82, rotateX: 10, filter: 'blur(18px)' }}
            animate={{ opacity: 1, scale: 1, rotateX: 0, filter: 'blur(0px)' }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div
              className={styles.heartBurst}
              initial={{ scale: 0, rotate: -25 }}
              animate={{ scale: [0, 1.18, 1], rotate: [-25, 8, 0] }}
              transition={{ delay: 0.15, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              aria-hidden="true"
            >
              ♡
            </motion.div>

            <div className={styles.glowFrame} aria-hidden="true" />
            <article className={styles.card}>
              <p className={styles.apologyLabel}>From the heart</p>
              <h1 className={styles.apologyTitle}>
                I&apos;m really sorry,
                <span>Harsimran.</span>
              </h1>

              <div className={styles.rule} aria-hidden="true">
                <span />
                <b>✦</b>
                <span />
              </div>

              <div className={styles.message}>
                <p>
                  I was disrespectful toward you and your father. It was wrong, and there is no
                  justification for it.
                </p>
                <p>
                  You both deserved respect from me, and I genuinely regret that I failed to show it.
                  I take full responsibility.
                </p>
              </div>

              <motion.button
                type="button"
                className={styles.flowerButton}
                onClick={() => setFlowerOpened(true)}
                disabled={flowerOpened}
                whileHover={flowerOpened ? undefined : { y: -4, rotate: -2 }}
                whileTap={flowerOpened ? undefined : { scale: 0.96 }}
              >
                <span className={styles.flower} aria-hidden="true">
                  🌷
                </span>
                <span>{flowerOpened ? 'One last honest thing' : 'Tap the flower'}</span>
              </motion.button>

              <AnimatePresence>
                {flowerOpened && (
                  <motion.div
                    className={styles.finalNote}
                    initial={{ opacity: 0, y: 18, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: 8, height: 0 }}
                    transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <p>
                      You do not owe me a reply or forgiveness. I only wanted to apologise properly
                      and tell you that I am truly sorry.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <p className={styles.signoff}>
                I hope this brings you at least one tiny smile.
                <span>That is all. No pressure. 🤍</span>
              </p>
            </article>
          </motion.section>
        )}
      </AnimatePresence>

      <p className={styles.footer}>made with honesty, regret, and a slightly unreasonable amount of CSS</p>
    </main>
  );
}
