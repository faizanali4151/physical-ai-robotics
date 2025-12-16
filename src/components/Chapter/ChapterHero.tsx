import React from 'react';
import Link from '@docusaurus/Link';
import clsx from 'clsx';
import type { ChapterHeroProps } from './types';
import styles from './ChapterHero.module.css';

export default function ChapterHero({ title, subtitle, icon = '📚' }: ChapterHeroProps): JSX.Element {
  return (
    <section className={styles.hero}>
      {/* Animated Gradient Background */}
      <div className={styles.gradientBg}>
        <div className={styles.gradientOrb1}></div>
        <div className={styles.gradientOrb2}></div>
        <div className={styles.gradientOrb3}></div>
      </div>

      {/* Floating Robot Icons */}
      <div className={styles.floatingElements}>
        <div className={clsx(styles.floatingRobot, styles.robot1)}>🤖</div>
        <div className={clsx(styles.floatingRobot, styles.robot2)}>🧠</div>
        <div className={clsx(styles.floatingRobot, styles.robot3)}>⚙️</div>
        <div className={clsx(styles.floatingRobot, styles.robot4)}>🦾</div>
      </div>

      {/* Hero Content */}
      <div className={styles.heroContent}>
        <div className={styles.iconWrapper} data-aos="zoom-in">
          <span className={styles.mainIcon}>{icon}</span>
        </div>

        <h1 className={styles.heroTitle} data-aos="fade-up">
          {title}
        </h1>

        <p className={styles.heroSubtitle} data-aos="fade-up" data-aos-delay="100">
          {subtitle}
        </p>

        {/* CTA Button */}
        <div className={styles.ctaContainer} data-aos="fade-up" data-aos-delay="200">
          <button
            className={styles.ctaButton}
            onClick={() => {
              const firstSection = document.querySelector('.markdown');
              if (firstSection) {
                firstSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }}
          >
            Get Started
            <span className={styles.ctaArrow}>→</span>
          </button>
        </div>

        {/* Scroll Indicator */}
        <div className={styles.scrollIndicator} data-aos="fade-up" data-aos-delay="300">
          <div className={styles.scrollArrow}>↓</div>
          <span className={styles.scrollText}>Scroll to explore</span>
        </div>
      </div>
    </section>
  );
}
