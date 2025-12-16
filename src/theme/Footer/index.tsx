import React from 'react';
import type { ReactNode } from 'react';
import { useLocation } from '@docusaurus/router';
import styles from './styles.module.css';

/**
 * Custom Footer component with conditional rendering based on page path
 *
 * - Login page (/login): No footer
 * - Landing page (/) and docs pages (/docs/*): Custom footer with contact info
 * - Other pages: No footer (can be customized as needed)
 */
export default function Footer(): ReactNode {
  const location = useLocation();

  // Hide footer on login page
  if (location.pathname === '/login') {
    return null;
  }

  // Show custom footer on landing page, docs pages, and new info pages
  const showCustomFooter =
    location.pathname === '/' ||
    location.pathname.startsWith('/docs') ||
    location.pathname === '/about' ||
    location.pathname === '/privacy-policy' ||
    location.pathname === '/terms-of-service';

  if (!showCustomFooter) {
    return null;
  }

  return (
    <footer className={styles.customFooter}>
      <div className={styles.footerContainer}>
        <div className={styles.footerContent}>
          {/* Left Section - About */}
          <div className={styles.footerSection}>
            <h3 className={styles.footerHeading}>Physical AI & Robotics</h3>
            <p className={styles.footerDescription}>
              A comprehensive guide to embodied intelligence and humanoid robotics.
              Learn the fundamentals and cutting-edge techniques.
            </p>
          </div>

          {/* Middle Section - Quick Links */}
          <div className={styles.footerSection}>
            <h4 className={styles.footerTitle}>Quick Links</h4>
            <ul className={styles.footerLinks}>
              <li>
                <a href="/docs/intro" className={styles.footerLink}>
                  Get Started
                </a>
              </li>
              <li>
                <a href="/docs/intro" className={styles.footerLink}>
                  Documentation
                </a>
              </li>
              <li>
                <a href="/" className={styles.footerLink}>
                  Home
                </a>
              </li>
            </ul>
          </div>

          {/* Right Section - Contact */}
          <div className={styles.footerSection}>
            <h4 className={styles.footerTitle}>Contact</h4>
            <div className={styles.contactInfo}>
              <a href="tel:0312xxxxxxx" className={styles.contactLink}>
                <svg className={styles.contactIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                0312xxxxxxx
              </a>
              <a href="mailto:fkaaa569@gmail.com" className={styles.contactLink}>
                <svg className={styles.contactIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                fkaaa569@gmail.com
              </a>
            </div>

            {/* Social Links */}
            <div className={styles.socialLinks}>
              <a
                href="https://github.com/faizanali4151"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label="GitHub"
              >
                <svg className={styles.socialIcon} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
              </a>
              <a
                href="https://linkedin.com/in/faizanali4151"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label="LinkedIn"
              >
                <svg className={styles.socialIcon} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a
                href="https://twitter.com/faizanali4151"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label="Twitter"
              >
                <svg className={styles.socialIcon} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={styles.footerBottom}>
          <p className={styles.copyright}>
            © {new Date().getFullYear()} Physical AI & Humanoid Robotics. All rights reserved.
          </p>
          <div className={styles.footerBottomLinks}>
            <a href="/privacy-policy" className={styles.bottomLink}>Privacy Policy</a>
            <span className={styles.separator}>•</span>
            <a href="/terms-of-service" className={styles.bottomLink}>Terms of Service</a>
            <span className={styles.separator}>•</span>
            <a href="/about" className={styles.bottomLink}>About</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
