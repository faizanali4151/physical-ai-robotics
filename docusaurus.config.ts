import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Physical AI & Humanoid Robotics',
  tagline: 'Master the future of embodied intelligence',
  favicon: 'img/robot-favicon.svg',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://physical-ai-book1.vercel.app',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'facebook', // Usually your GitHub org/user name.
  projectName: 'docusaurus', // Usually your repo name.

  onBrokenLinks: 'throw',

  // Internationalization configuration
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  // Custom fields accessible in browser via window.docusaurus.siteConfig.customFields
  customFields: {
    authUrl: process.env.AUTH_URL || process.env.NODE_ENV === 'production'
      ? 'https://physical-ai-backend.onrender.com'
      : 'http://localhost:3001',
    chatbotApiUrl: process.env.CHATBOT_API_URL || process.env.NODE_ENV === 'production'
      ? 'https://physical-ai-backend.onrender.com'
      : 'http://localhost:8000',
  },

  plugins: [
    [
      './frontend/docusaurus-plugin-rag-chatbot',
      {
        apiEndpoint: process.env.CHATBOT_API_URL || process.env.NODE_ENV === 'production'
          ? 'https://physical-ai-backend.onrender.com'
          : 'http://localhost:8000',
      },
    ],
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: 'docs',
          // Disable default Docusaurus Previous/Next buttons
          showLastUpdateAuthor: false,
          showLastUpdateTime: false,
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/muhammad-faizan/physical-ai-book/tree/main/website/',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    docs: {
      sidebar: {
        hideable: true,
        autoCollapseCategories: true,
      },
    },
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Physical AI & Humanoid Robotics',
      logo: {
        alt: 'Robot Logo',
        src: 'img/robot-logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'bookSidebar',
          position: 'left',
          label: 'Book',
        },
        {
          type: 'dropdown',
          label: 'More',
          position: 'left',
          items: [
            {
              label: 'About',
              to: '/about',
            },
            {
              label: 'Privacy Policy',
              to: '/privacy-policy',
            },
            {
              label: 'Terms of Service',
              to: '/terms-of-service',
            },
          ],
        },
        {
          type: 'search',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Book',
          items: [
            {
              label: 'Start Reading',
              to: '/docs/intro',
            },
          ],
        },
        {
          title: 'Connect',
          items: [
            {
              label: 'Home',
              to: '/',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/muhammad-faizan/physical-ai-book',
            },
            {
              label: 'Report Issue',
              href: 'https://github.com/muhammad-faizan/physical-ai-book/issues',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Blog',
              to: '/blog',
            },
            {
              label: 'Docusaurus',
              href: 'https://docusaurus.io',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Faizan Khan. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
    mermaid: {
      theme: { light: 'base', dark: 'dark' },
      options: {
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: 18,
        curve: 'basis',
        flowchart: {
          nodeSpacing: 100,
          rankSpacing: 100,
          padding: 30,
          useMaxWidth: true,
          htmlLabels: true,
          curve: 'basis',
        },
        sequence: {
          actorMargin: 80,
          boxMargin: 20,
          boxTextMargin: 10,
          noteMargin: 20,
          messageMargin: 50,
          useMaxWidth: true,
        },
        gantt: {
          useMaxWidth: true,
          fontSize: 18,
        },
        journey: {
          useMaxWidth: true,
        },
        class: {
          useMaxWidth: true,
        },
        state: {
          useMaxWidth: true,
        },
        er: {
          useMaxWidth: true,
        },
        pie: {
          useMaxWidth: true,
        },
        themeVariables: {
          // Primary colors
          primaryColor: '#667eea',
          primaryTextColor: '#ffffff',
          primaryBorderColor: '#5568e3',

          // Secondary colors
          secondaryColor: '#4facfe',
          secondaryTextColor: '#ffffff',
          secondaryBorderColor: '#3b9bea',

          // Tertiary colors
          tertiaryColor: '#f093fb',
          tertiaryTextColor: '#ffffff',
          tertiaryBorderColor: '#e07fe9',

          // Lines and edges
          lineColor: '#6b7280',
          edgeLabelBackground: '#ffffff',

          // Node styling
          mainBkg: '#667eea',
          nodeBorder: '#5568e3',
          clusterBkg: '#f9fafb',
          clusterBorder: '#d1d5db',

          // Font settings
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          fontSize: '18px',

          // Additional colors
          criticalColor: '#ef4444',
          errorBkgColor: '#fee2e2',
          errorTextColor: '#991b1b',

          warningColor: '#f59e0b',
          warningBkgColor: '#fef3c7',
          warningTextColor: '#92400e',

          successColor: '#10b981',
          successBkgColor: '#d1fae5',
          successTextColor: '#065f46',

          infoColor: '#3b82f6',
          infoBkgColor: '#dbeafe',
          infoTextColor: '#1e40af',
        },
      },
    },
  } satisfies Preset.ThemeConfig,
  markdown: {
    mermaid: true,
  },
  themes: ['@docusaurus/theme-mermaid'],
};

export default config;
