/**
 * Hover-to-Ask Feature
 *
 * Allows users to hover over book content and ask the chatbot about it.
 * Shows a tooltip with "Ask Chatbot" button on hover.
 */

import React, { useEffect, useState } from 'react';
import './styles.css';

const HoverToAsk: React.FC = () => {
  const [hoveredElement, setHoveredElement] = useState<HTMLElement | null>(null);
  const [selectedText, setSelectedText] = useState('');
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    console.log('[HoverToAsk] Component mounted');

    // Selector for book content elements - Enhanced for better chapter coverage
    const contentSelector = [
      // Main content paragraphs
      '.markdown p',
      '.markdown li',
      '.markdown h2',
      '.markdown h3',
      '.markdown h4',
      '.markdown blockquote',
      // Docusaurus 3 specific
      '.theme-doc-markdown p',
      '.theme-doc-markdown li',
      '.theme-doc-markdown h2',
      '.theme-doc-markdown h3',
      '.theme-doc-markdown h4',
      '.theme-doc-markdown blockquote',
      // Article elements
      'article p',
      'article li',
      'article h2',
      'article h3',
      'article blockquote',
      // Generic markdown classes
      '[class*="markdown"] p',
      '[class*="markdown"] li',
      '[class*="markdown"] h2',
      '[class*="markdown"] h3',
      '[class*="markdown"] blockquote',
      // Specific doc content
      '.theme-doc-markdown > p',
      '.theme-doc-markdown > div > p',
      'main article p',
      'main article li'
    ].join(', ');

    const handleMouseEnter = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Check if target matches our selector
      if (target.matches(contentSelector)) {
        const text = target.textContent?.trim();
        if (text && text.length > 30 && text.length < 1000) {
          console.log('[HoverToAsk] Hovering over content, length:', text.length);

          setHoveredElement(target);
          setSelectedText(text);

          // Position tooltip near the element
          const rect = target.getBoundingClientRect();
          const viewportWidth = window.innerWidth;

          // Position tooltip to avoid overflow
          let x = Math.max(10, Math.min(rect.left, viewportWidth - 220));
          let y = rect.top - 50;

          // If tooltip would go off top of screen, position below
          if (y < 10) {
            y = rect.bottom + 10;
          }

          setTooltipPosition({ x, y });
          setShowTooltip(true);
          target.classList.add('hover-to-ask-highlight');
        }
      }
    };

    const handleMouseLeave = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target === hoveredElement) {
        target.classList.remove('hover-to-ask-highlight');
        // Delay hiding to allow clicking tooltip
        setTimeout(() => {
          setShowTooltip(false);
        }, 200);
      }
    };

    // Add listeners to all content elements
    const addListeners = () => {
      const elements = document.querySelectorAll(contentSelector);
      console.log('[HoverToAsk] Adding listeners to', elements.length, 'elements');
      console.log('[HoverToAsk] Selector used:', contentSelector.substring(0, 100) + '...');

      elements.forEach((element) => {
        element.addEventListener('mouseenter', handleMouseEnter as EventListener);
        element.addEventListener('mouseleave', handleMouseLeave as EventListener);
      });

      return elements.length;
    };

    // Initial setup with retry logic
    let attempts = 0;
    const maxAttempts = 5;

    const tryAddListeners = () => {
      attempts++;
      const count = addListeners();

      if (count === 0 && attempts < maxAttempts) {
        console.log(`[HoverToAsk] No elements found, retrying in 1s (attempt ${attempts}/${maxAttempts})`);
        setTimeout(tryAddListeners, 1000);
      } else if (count > 0) {
        console.log('[HoverToAsk] Successfully initialized with', count, 'elements');
      } else {
        console.warn('[HoverToAsk] No content elements found after', maxAttempts, 'attempts');
      }
    };

    // Start with delay to ensure DOM is ready
    setTimeout(tryAddListeners, 500);

    // Re-add listeners when DOM changes (for dynamically loaded content)
    const observer = new MutationObserver((mutations) => {
      // Debounce: only re-add if significant changes
      if (mutations.length > 5) {
        addListeners();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      const elements = document.querySelectorAll(contentSelector);
      elements.forEach((element) => {
        element.removeEventListener('mouseenter', handleMouseEnter as EventListener);
        element.removeEventListener('mouseleave', handleMouseLeave as EventListener);
        element.classList.remove('hover-to-ask-highlight');
      });
      observer.disconnect();
    };
  }, [hoveredElement]);

  const handleAsk = () => {
    if (selectedText) {
      console.log('[HoverToAsk] Asking about text:', selectedText.substring(0, 50));

      // Dispatch custom event to chatbot
      window.dispatchEvent(
        new CustomEvent('chatbot:ask', {
          detail: {
            text: selectedText,
            query: `Explain this content: "${selectedText.substring(0, 200)}${selectedText.length > 200 ? '...' : ''}"`,
          },
        })
      );

      setShowTooltip(false);
      if (hoveredElement) {
        hoveredElement.classList.remove('hover-to-ask-highlight');
      }
      setHoveredElement(null);
      setSelectedText('');
    }
  };

  if (!showTooltip) {
    return null;
  }

  return (
    <div
      className="hover-to-ask-tooltip"
      style={{
        left: `${tooltipPosition.x}px`,
        top: `${tooltipPosition.y}px`,
      }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => {
        setShowTooltip(false);
        if (hoveredElement) {
          hoveredElement.classList.remove('hover-to-ask-highlight');
        }
      }}
    >
      <button className="hover-to-ask-button" onClick={handleAsk}>
        <svg
          className="hover-to-ask-icon"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          {/* Robot icon */}
          <rect x="5" y="8" width="14" height="11" rx="2" fill="currentColor" fillOpacity="0.15" />
          <rect x="5" y="8" width="14" height="11" rx="2" />
          <circle cx="9" cy="12" r="1.5" fill="currentColor" />
          <circle cx="15" cy="12" r="1.5" fill="currentColor" />
          <line x1="12" y1="8" x2="12" y2="5" />
          <circle cx="12" cy="4" r="1" fill="currentColor" />
          <path d="M9 15 Q12 17 15 15" fill="none" />
        </svg>
        <span>Ask Physical AI Assistant</span>
      </button>
    </div>
  );
};

// Auto-inject HoverToAsk feature on page load
if (typeof document !== 'undefined') {
  const initHoverToAsk = () => {
    console.log('[HoverToAsk] Auto-initializing');

    // Check if already exists
    if (document.getElementById('hover-to-ask-root')) {
      console.log('[HoverToAsk] Already initialized');
      return;
    }

    // Create root element
    const root = document.createElement('div');
    root.id = 'hover-to-ask-root';
    document.body.appendChild(root);

    // Render component
    import('react-dom/client').then(({ createRoot }) => {
      const reactRoot = createRoot(root);
      reactRoot.render(<HoverToAsk />);
      console.log('[HoverToAsk] Rendered successfully');
    }).catch((err) => {
      console.error('[HoverToAsk] Failed to render:', err);
    });
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHoverToAsk);
  } else {
    initHoverToAsk();
  }
}

export default HoverToAsk;
