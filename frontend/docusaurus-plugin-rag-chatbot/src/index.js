/**
 * Docusaurus RAG Chatbot Plugin
 * Entry point for the plugin that adds a chat widget to the site.
 */

const path = require('path');

module.exports = function (context, options) {
  return {
    name: 'docusaurus-plugin-rag-chatbot',

    getClientModules() {
      return [
        path.resolve(__dirname, './theme/ChatWidget'),
        path.resolve(__dirname, './theme/HoverToAsk'),
      ];
    },

    injectHtmlTags() {
      // Determine the API endpoint based on environment
      let apiEndpoint = options.apiEndpoint;

      // If no endpoint provided or it's localhost, use production URL
      if (!apiEndpoint || apiEndpoint === 'http://localhost:8000') {
        // Check if we're in production build
        const isProduction = process.env.NODE_ENV === 'production';
        apiEndpoint = isProduction
          ? 'https://physical-ai-backend.onrender.com'
          : 'http://localhost:8000';
      }

      return {
        headTags: [
          {
            tagName: 'meta',
            attributes: {
              name: 'rag-chatbot-api',
              content: apiEndpoint,
            },
          },
        ],
      };
    },

    getThemePath() {
      return path.resolve(__dirname, './theme');
    },
  };
};
