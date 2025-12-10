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
      return {
        headTags: [
          {
            tagName: 'meta',
            attributes: {
              name: 'rag-chatbot-api',
              content: options.apiEndpoint || 'http://localhost:8000',
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
