import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  // Book sidebar with all chapters
  bookSidebar: [
    {
      type: 'doc',
      id: 'intro',
      label: 'Chapter 1: Introduction to Physical AI',
    },
    {
      type: 'doc',
      id: 'foundations',
      label: 'Chapter 2: Foundations of Robotics',
    },
    {
      type: 'doc',
      id: 'perception',
      label: 'Chapter 3: Perception Systems',
    },
    {
      type: 'doc',
      id: 'motion-planning',
      label: 'Chapter 4: Motion Planning & Control',
    },
    {
      type: 'doc',
      id: 'learning',
      label: 'Chapter 5: Machine Learning for Robotics',
    },
    {
      type: 'doc',
      id: 'robot-vision',
      label: 'Chapter 6: Robot Vision',
    },
    {
      type: 'doc',
      id: 'sensors-actuators',
      label: 'Chapter 7: Sensors & Actuators',
    },
    {
      type: 'doc',
      id: 'control-theory',
      label: 'Chapter 8: Control Theory',
    },
    {
      type: 'doc',
      id: 'hri',
      label: 'Chapter 9: Human-Robot Interaction',
    },
    {
      type: 'doc',
      id: 'autonomous-navigation',
      label: 'Chapter 10: Autonomous Navigation',
    },
    {
      type: 'doc',
      id: 'simulation',
      label: 'Chapter 11: Simulation & Digital Twins',
    },
    {
      type: 'doc',
      id: 'locomotion',
      label: 'Chapter 12: Humanoid Locomotion',
    },
    {
      type: 'doc',
      id: 'manipulation',
      label: 'Chapter 13: Grasping & Manipulation',
    },
    {
      type: 'doc',
      id: 'ethics',
      label: 'Chapter 14: Ethics & Safety',
    },
  ],
};

export default sidebars;
