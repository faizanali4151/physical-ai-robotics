import { useEffect, useState, type ReactNode } from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';
import { authClient } from '../lib/auth-client';
import AOS from 'aos';
import 'aos/dist/aos.css';

import styles from './index.module.css';

// Feature Card Component
function FeatureCard({ icon, title, description, delay }: {
  icon: string;
  title: string;
  description: string;
  delay: string;
}) {
  return (
    <div
      className={styles.featureCard}
      data-aos="fade-up"
      data-aos-delay={delay}
    >
      <div className={styles.featureIcon}>{icon}</div>
      <h3 className={styles.featureTitle}>{title}</h3>
      <p className={styles.featureDescription}>{description}</p>
    </div>
  );
}

// Chapter Card Component
function ChapterCard({ number, title, topics, delay, url }: {
  number: number;
  title: string;
  topics: string[];
  delay: string;
  url: string;
}) {
  return (
    <Link
      to={url}
      className={styles.chapterCard}
      data-aos="fade-up"
      data-aos-delay={delay}
    >
      <div className={styles.chapterNumber}>Chapter {number}</div>
      <h4 className={styles.chapterTitle}>{title}</h4>
      <ul className={styles.chapterTopics}>
        {topics.map((topic, idx) => (
          <li key={idx}>{topic}</li>
        ))}
      </ul>
    </Link>
  );
}

// Hero Section
function Hero() {
  const { siteConfig } = useDocusaurusContext();

  return (
    <section className={styles.hero}>
      {/* Animated Gradient Background */}
      <div className={styles.gradientBg}>
        <div className={styles.gradientOrb1}></div>
        <div className={styles.gradientOrb2}></div>
        <div className={styles.gradientOrb3}></div>
      </div>

      {/* Floating Robot Illustrations */}
      <div className={styles.floatingElements}>
        <div className={clsx(styles.floatingRobot, styles.robot1)}>🤖</div>
        <div className={clsx(styles.floatingRobot, styles.robot2)}>⚙️</div>
        <div className={clsx(styles.floatingRobot, styles.robot3)}>🦾</div>
        <div className={clsx(styles.floatingRobot, styles.robot4)}>🧠</div>
      </div>

      <div className={styles.heroContent}>
        <div
          className={styles.badge}
          data-aos="fade-down"
        >
          <span className={styles.badgeDot}></span>
          Free & Open Source
        </div>

        <Heading as="h1" className={styles.heroTitle} data-aos="fade-up">
          Physical AI &<br />
          <span className={styles.gradientText}>Humanoid Robotics</span>
        </Heading>

        <p className={styles.heroSubtitle} data-aos="fade-up" data-aos-delay="100">
          Master the fundamentals of embodied intelligence, robot perception,
          and cutting-edge humanoid systems. From theory to practice.
        </p>

        <div className={styles.heroButtons} data-aos="fade-up" data-aos-delay="200">
          <Link
            className={clsx('button', styles.primaryButton)}
            to="/docs/intro">
            Get Started
            <span className={styles.buttonArrow}>→</span>
          </Link>
          <Link
            className={clsx('button', styles.secondaryButton)}
            to="/docs/intro">
            View Chapters
          </Link>
        </div>

        <div className={styles.heroStats} data-aos="fade-up" data-aos-delay="300">
          <div className={styles.stat}>
            <div className={styles.statNumber}>15</div>
            <div className={styles.statLabel}>Chapters</div>
          </div>
          <div className={styles.statDivider}></div>
          <div className={styles.stat}>
            <div className={styles.statNumber}>5,000+</div>
            <div className={styles.statLabel}>Words</div>
          </div>
          <div className={styles.statDivider}></div>
          <div className={styles.stat}>
            <div className={styles.statNumber}>100%</div>
            <div className={styles.statLabel}>Free</div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Features Section
function Features() {
  return (
    <section className={styles.features}>
      <div className={styles.container}>
        <div className={styles.sectionHeader} data-aos="fade-up">
          <h2 className={styles.sectionTitle}>Why This Book?</h2>
          <p className={styles.sectionSubtitle}>
            Everything you need to understand and build with Physical AI
          </p>
        </div>

        <div className={styles.featuresGrid}>
          <FeatureCard
            icon="📚"
            title="Comprehensive Coverage"
            description="From basic robotics to advanced humanoid systems, covering perception, control, and learning."
            delay="0"
          />
          <FeatureCard
            icon="💻"
            title="Practical Examples"
            description="Real code samples, diagrams, and hands-on examples using Python and modern frameworks."
            delay="100"
          />
          <FeatureCard
            icon="🚀"
            title="Cutting-Edge Content"
            description="Learn about Atlas, Optimus, Figure 01, and the latest advances in humanoid robotics."
            delay="200"
          />
        </div>
      </div>
    </section>
  );
}

// About Section
function About() {
  return (
    <section className={styles.about}>
      <div className={styles.container}>
        <div className={styles.aboutGrid}>
          <div className={styles.aboutContent} data-aos="fade-right">
            <div className={styles.badge}>
              <span className={styles.badgeDot}></span>
              About The Book
            </div>
            <h2 className={styles.aboutTitle}>
              Building the Future of<br />
              <span className={styles.gradientText}>Intelligent Machines</span>
            </h2>
            <p className={styles.aboutText}>
              This comprehensive guide takes you through the fascinating world of Physical AI
              and humanoid robotics. Whether you're a student, engineer, or enthusiast, you'll
              gain deep insights into how modern robots perceive, think, and act in the physical world.
            </p>
            <p className={styles.aboutText}>
              Learn the mathematical foundations, explore state-of-the-art algorithms, and
              understand the engineering challenges behind systems like Boston Dynamics' Atlas
              and Tesla's Optimus.
            </p>
            <div className={styles.aboutFeatures}>
              <div className={styles.aboutFeature}>
                <span className={styles.checkmark}>✓</span>
                <span>Beginner to Intermediate Level</span>
              </div>
              <div className={styles.aboutFeature}>
                <span className={styles.checkmark}>✓</span>
                <span>Code Examples & Diagrams</span>
              </div>
              <div className={styles.aboutFeature}>
                <span className={styles.checkmark}>✓</span>
                <span>Real-World Applications</span>
              </div>
              <div className={styles.aboutFeature}>
                <span className={styles.checkmark}>✓</span>
                <span>Ethics & Future Directions</span>
              </div>
            </div>
          </div>
          <div className={styles.aboutImage} data-aos="fade-left">
            <div className={styles.imageCard}>
              <div className={styles.imageCardContent}>
                <div className={styles.codeBlock}>
                  <div className={styles.codeHeader}>
                    <div className={styles.codeDots}>
                      <span></span><span></span><span></span>
                    </div>
                    <span className={styles.codeTitle}>robot_control.py</span>
                  </div>
                  <div className={styles.codeContent}>
                    <div className={styles.codeLine}>
                      <span className={styles.keyword}>import</span> numpy <span className={styles.keyword}>as</span> np
                    </div>
                    <div className={styles.codeLine}>
                      <span className={styles.keyword}>from</span> robot <span className={styles.keyword}>import</span> Humanoid
                    </div>
                    <div className={styles.codeLine}></div>
                    <div className={styles.codeLine}>
                      <span className={styles.keyword}>def</span> <span className={styles.function}>control_balance</span>(robot):
                    </div>
                    <div className={styles.codeLine}>
                      &nbsp;&nbsp;state = robot.<span className={styles.function}>get_state</span>()
                    </div>
                    <div className={styles.codeLine}>
                      &nbsp;&nbsp;<span className={styles.keyword}>return</span> compute_torque(state)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Course Outline Section
function CourseOutline() {
  const chapters = [
    {
      number: 1,
      title: "Introduction to Physical AI",
      topics: ["What is Physical AI", "Embodied Intelligence", "Humanoid Robotics Overview"],
      url: "/docs/intro"
    },
    {
      number: 2,
      title: "Foundations of Robotics",
      topics: ["Robot Anatomy", "Kinematics & Dynamics", "Control Systems"],
      url: "/docs/foundations"
    },
    {
      number: 3,
      title: "Perception Systems",
      topics: ["Vision Systems", "LIDAR & Mapping", "Sensor Fusion"],
      url: "/docs/perception"
    },
    {
      number: 4,
      title: "Motion Planning & Control",
      topics: ["Path Planning", "Trajectory Optimization", "Inverse Kinematics"],
      url: "/docs/motion-planning"
    },
    {
      number: 5,
      title: "Machine Learning for Robotics",
      topics: ["Reinforcement Learning", "Imitation Learning", "Sim-to-Real Transfer"],
      url: "/docs/learning"
    },
    {
      number: 6,
      title: "Robot Vision",
      topics: ["Computer Vision", "Object Detection", "Visual Servoing"],
      url: "/docs/robot-vision"
    },
    {
      number: 7,
      title: "Sensors & Actuators",
      topics: ["Sensor Types", "Motor Control", "Proprioception"],
      url: "/docs/sensors-actuators"
    },
    {
      number: 8,
      title: "Control Theory",
      topics: ["PID Control", "State Space", "Adaptive Control"],
      url: "/docs/control-theory"
    },
    {
      number: 9,
      title: "Human-Robot Interaction",
      topics: ["Natural Language Processing", "Social Robotics", "Safety"],
      url: "/docs/hri"
    },
  ];

  return (
    <section className={styles.outline}>
      <div className={styles.container}>
        <div className={styles.sectionHeader} data-aos="fade-up">
          <h2 className={styles.sectionTitle}>Course Outline</h2>
          <p className={styles.sectionSubtitle}>
            15 comprehensive chapters covering everything from basics to advanced topics
          </p>
        </div>

        <div className={styles.chaptersGrid}>
          {chapters.map((chapter, idx) => (
            <ChapterCard
              key={chapter.number}
              number={chapter.number}
              title={chapter.title}
              topics={chapter.topics}
              url={chapter.url}
              delay={`${idx * 50}`}
            />
          ))}
        </div>

        <div className={styles.moreChapters} data-aos="fade-up">
          <p>+ 6 more chapters covering Hardware Design, State of the Art, Applications, Ethics, Future Directions, and Resources</p>
        </div>
      </div>
    </section>
  );
}

// CTA Section
function CTA() {
  return (
    <section className={styles.cta}>
      <div className={styles.ctaContent} data-aos="zoom-in">
        <h2 className={styles.ctaTitle}>Ready to Begin Your Journey?</h2>
        <p className={styles.ctaSubtitle}>
          Start learning about Physical AI and humanoid robotics today
        </p>
        <Link
          className={clsx('button', styles.ctaButton)}
          to="/docs/intro">
          Get Started Now
          <span className={styles.buttonArrow}>→</span>
        </Link>
      </div>
    </section>
  );
}

// Main Component
export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication using Better Auth
    const checkAuth = async () => {
      if (ExecutionEnvironment.canUseDOM) {
        try {
          const session = await authClient.getSession();
          if (session.data?.user) {
            console.log('✅ User authenticated:', session.data.user.email);
            setIsAuthenticated(true);
            setIsLoading(false);
          } else {
            console.log('❌ No session, redirecting to login');
            window.location.href = '/login';
          }
        } catch (err) {
          console.error('❌ Auth check error:', err);
          window.location.href = '/login';
        }
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    // Initialize AOS only after authentication check
    if (isAuthenticated) {
      AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true,
        mirror: false,
      });
    }
  }, [isAuthenticated]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '4px solid rgba(255, 255, 255, 0.3)',
          borderTop: '4px solid white',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Don't render content if not authenticated (redirect will happen)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <Layout
      title={`${siteConfig.title}`}
      description="A comprehensive guide to Physical AI, embodied intelligence, and humanoid robotics">
      <main className={styles.main}>
        <Hero />
        <Features />
        <About />
        <CourseOutline />
        <CTA />
      </main>
    </Layout>
  );
}
