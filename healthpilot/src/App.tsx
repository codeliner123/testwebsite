import { useState, useEffect, useCallback, useRef } from 'react';
import styled from '@emotion/styled';
import { motion, useScroll, useTransform } from 'framer-motion';
import Particles from 'react-tsparticles';
import { loadSlim } from "tsparticles-slim";
import type { Container as ParticlesContainer, Engine } from "tsparticles-engine";

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  background: #E9F1FA;
  overflow-x: hidden;
`;

const CoralBackground = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  opacity: 0.15;
  background-image: 
    radial-gradient(circle at 20% 30%, #00ABE4 0%, transparent 70%),
    radial-gradient(circle at 80% 70%, #0077B6 0%, transparent 70%),
    radial-gradient(circle at 40% 80%, #005F92 0%, transparent 70%),
    radial-gradient(circle at 60% 20%, #00ABE4 0%, transparent 70%);
  filter: blur(60px);
  pointer-events: none;
`;

const ParticlesWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  pointer-events: none;
`;

const Content = styled.div`
  position: relative;
  z-index: 3;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Hero = styled.div`
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 2rem;
  position: relative;
`;

const Title = styled.h1`
  font-size: 4rem;
  color: #00ABE4;
  margin-bottom: 1rem;
  text-shadow: 0 0 10px rgba(0, 171, 228, 0.3);
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.8rem;
  color: #00ABE4;
  margin-bottom: 3rem;
  text-shadow: 0 0 10px rgba(0, 171, 228, 0.3);
  @media (max-width: 768px) {
    font-size: 1.4rem;
  }
`;

const FormSection = styled.div`
  width: 100%;
  padding: 4rem 2rem;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  z-index: 2;
  min-height: 100vh;
`;

const Form = styled.form`
  background: rgba(255, 255, 255, 0.9);
  padding: 3rem;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 171, 228, 0.15);
  width: 100%;
  max-width: 500px;
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem;
  border: 2px solid rgba(0, 171, 228, 0.2);
  border-radius: 10px;
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.9);
  color: #00ABE4;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #00ABE4;
    box-shadow: 0 0 0 3px rgba(0, 171, 228, 0.1);
  }

  &::placeholder {
    color: rgba(0, 171, 228, 0.6);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 1rem;
  border: 2px solid rgba(0, 171, 228, 0.2);
  border-radius: 10px;
  font-size: 1rem;
  min-height: 120px;
  background: rgba(255, 255, 255, 0.9);
  color: #00ABE4;
  resize: vertical;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #00ABE4;
    box-shadow: 0 0 0 3px rgba(0, 171, 228, 0.1);
  }

  &::placeholder {
    color: rgba(0, 171, 228, 0.6);
  }
`;

const Button = styled(motion.button)<{ $scrollProgress: number; $isScrolling: boolean }>`
  background: #0077B6;
  color: white;
  border: none;
  padding: 1.2rem 3rem;
  font-size: 1.4rem;
  font-weight: 600;
  border-radius: 50px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 171, 228, 0.3);
  transition: all 0.3s ease;
  min-width: 280px;
  letter-spacing: 0.5px;
  text-transform: uppercase;

  &:hover {
    background: #005F92;
    box-shadow: 0 6px 20px rgba(0, 171, 228, 0.4);
  }

  &::before {
    content: '';
    position: absolute;
    top: -10%;
    left: ${props => `${-200 + (props.$scrollProgress * 4)}%`};
    width: 300%;
    height: 120%;
    background: linear-gradient(
      120deg,
      transparent,
      rgba(255, 255, 255, 0.7),
      transparent
    );
    transform: rotate(120deg);
    transform-origin: center;
    transition: left 0.06s linear, opacity 0.15s ease-out;
    filter: blur(1px);
    opacity: ${props => props.$isScrolling ? 1 : 0};
  }
`;

const FormButton = styled(Button)`
  margin-top: 1rem;
  width: 100%;
  position: relative;
  transform: none;
  left: auto;
  top: auto;
`;

const CardContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  perspective: 1000px;
`;

const Card = styled(motion.div)<{ $scrollProgress: number }>`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  color: #00ABE4;
  box-shadow: 0 8px 32px rgba(0, 171, 228, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transform-style: preserve-3d;
  transform: 
    rotateX(${props => (props.$scrollProgress - 50) * 0.1}deg)
    rotateY(${props => (props.$scrollProgress - 50) * 0.1}deg);
  transition: transform 0.3s ease-out;

  &:hover {
    transform: scale(1.02) translateY(-5px);
    box-shadow: 0 12px 40px rgba(0, 171, 228, 0.15);
  }
`;

const CardTitle = styled.h3`
  font-size: 1.8rem;
  margin-bottom: 1rem;
  color: #0077B6;
  text-align: center;
`;

const CardSubtitle = styled.h4`
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
  color: #00ABE4;
  text-align: center;
  font-weight: 500;
`;

const CardContent = styled.p`
  font-size: 1rem;
  line-height: 1.6;
  color: #333;
  margin-bottom: 1rem;
`;

const StatsSection = styled.div`
  padding: 4rem 2rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  margin: 2rem auto;
  max-width: 1200px;
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 171, 228, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const StatsContainer = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;
`;

const ChartContainer = styled.div`
  position: relative;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  overflow: hidden;
  flex: 1;
  min-width: 300px;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const BarChart = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 1rem;
  height: 200px;
  padding: 1rem;
  width: 100%;
  justify-content: center;
`;

const Bar = styled(motion.div)<{ $height: number }>`
  width: 40px;
  background: linear-gradient(180deg, #00ABE4 0%, #0077B6 100%);
  border-radius: 8px 8px 0 0;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 171, 228, 0.2);
  transition: height 0.3s ease-out;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 300%;
    height: 100%;
    background: linear-gradient(
      120deg,
      transparent 0%,
      rgba(255, 255, 255, 0.6) 50%,
      transparent 100%
    );
    transform: rotate(120deg);
    transition: opacity 0.15s ease-out;
  }
`;

const CircularChart = styled.div`
  position: relative;
  width: 200px;
  height: 200px;
  margin: 0 auto;
`;

const Circle = styled(motion.circle)`
  fill: none;
  stroke: #00ABE4;
  stroke-width: 8;
  stroke-linecap: round;
  transform-origin: center;
  transform: rotate(-90deg);
`;

const ChartLabel = styled(motion.div)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #0077B6;
  font-size: 1.5rem;
  font-weight: bold;
`;

const StatsTitle = styled.h2`
  text-align: center;
  color: #0077B6;
  font-size: 2rem;
  margin-bottom: 2rem;
`;

const StarContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
`;

const StarsWrapper = styled.div`
  display: flex;
  gap: 0.5rem;
  font-size: 2.5rem;
`;

const Star = styled(motion.div)`
  color: #ccc;
  position: relative;
  overflow: hidden;
  width: 1em;
  height: 1em;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: scale(0.5);

  &::before {
    content: '★';
    position: absolute;
    color: #FFD700;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const RatingLabel = styled(motion.div)`
  font-size: 1.2rem;
  color: #00ABE4;
  font-weight: 500;
  text-align: center;
  opacity: 0;
  transform: translateY(20px);
`;

// How It Works Section Styles (updated for blue theme and animation)
const HowItWorksSection = styled.section`
  width: 100%;
  max-width: 1100px;
  margin: 3rem auto 2rem auto;
  padding: 2.5rem 1rem 2rem 1rem;
  background: linear-gradient(120deg, #E9F1FA 60%, #fff 100%);
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0, 171, 228, 0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
`;

const HowItWorksTag = styled.div`
  background: #E9F1FA;
  color: #0077B6;
  font-size: 0.95rem;
  padding: 0.3rem 1.2rem;
  border-radius: 16px;
  margin-bottom: 1.2rem;
  letter-spacing: 1px;
  font-weight: 500;
`;

const HowItWorksTitle = styled.h2`
  color: #0077B6;
  font-size: 2.1rem;
  font-weight: 700;
  margin-bottom: 2.2rem;
  text-align: center;
`;

const HowItWorksGrid = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
`;

const HowItWorksRow2 = styled.div`
  display: flex;
  justify-content: center;
  gap: 3.5rem;
  width: 100%;
  margin-bottom: 0.5rem;
  margin-top: 0.5rem;
`;

const HowItWorksAgent = styled.div`
  background: #0077B6;
  color: #fff;
  font-size: 1.35rem;
  font-weight: 700;
  border-radius: 18px;
  padding: 1.2rem 2.5rem;
  margin: 2.2rem 0 1.2rem 0;
  box-shadow: 0 4px 24px rgba(0, 171, 228, 0.13);
  display: flex;
  align-items: center;
  position: relative;
  z-index: 2;
`;

const HowItWorksAgentCenter = styled(HowItWorksAgent)`
  margin: 0.5rem 0 0.5rem 0;
  align-self: center;
`;

const HowItWorksLines2 = styled.svg`
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 180px;
  pointer-events: none;
  z-index: 1;
`;

const HowItWorksPill = styled.div`
  background: #fff;
  color: #00ABE4;
  border-radius: 2rem;
  padding: 0.8rem 2rem;
  font-size: 1.12rem;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 171, 228, 0.07);
  border: 2px solid #E9F1FA;
  margin: 0.2rem 0;
  position: relative;
  z-index: 2;
`;

// Feature Highlights Section Styles
const FeatureHighlightsSection = styled.section`
  width: 100%;
  max-width: 1100px;
  margin: 2.5rem auto 1.5rem auto;
  padding: 1.5rem 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  justify-content: center;
  background: linear-gradient(120deg, #E9F1FA 80%, #fff 100%);
  border-radius: 20px;
  box-shadow: 0 4px 24px rgba(0, 171, 228, 0.07);
`;

const FeatureCard = styled.div`
  background: #fff;
  color: #0077B6;
  border-radius: 1.2rem;
  padding: 1.1rem 1.6rem;
  font-size: 1.08rem;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(0, 171, 228, 0.06);
  border: 1.5px solid #E9F1FA;
  min-width: 220px;
  max-width: 320px;
  flex: 1 1 220px;
  display: flex;
  align-items: center;
  gap: 0.7rem;
`;

const CTASection = styled.section`
  width: 100%;
  max-width: 900px;
  margin: 2.5rem auto 2rem auto;
  padding: 2rem 1.5rem;
  background: #00ABE4;
  color: #fff;
  border-radius: 18px;
  box-shadow: 0 4px 24px rgba(0, 171, 228, 0.13);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const CTATitle = styled.h3`
  font-size: 1.7rem;
  font-weight: 700;
  margin-bottom: 1.1rem;
`;

const CTADesc = styled.p`
  font-size: 1.15rem;
  font-weight: 400;
  margin-bottom: 0.5rem;
`;

const AnimatedLightBarPath = ({ pathId, d }: { pathId: string; d: string }) => (
  <>
    <defs>
      <path id={pathId} d={d} />
    </defs>
    <circle r="7" fill="white" filter="url(#glow)" >
      <animateMotion dur="1.8s" repeatCount="indefinite">
        <mpath xlinkHref={`#${pathId}`} />
      </animateMotion>
    </circle>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </>
);

function App() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { scrollYProgress } = useScroll();
  
  const circleProgress = useTransform(
    scrollYProgress,
    [0, 0.5],
    [0, 1]
  );

  const percentage = useTransform(
    circleProgress,
    [0, 1],
    ["0%", "100%"]
  );

  const barProgress = useTransform(
    scrollYProgress,
    [0, 0.5],
    [0, 1]
  );

  // Create motion values for each bar
  const bar1Height = useTransform(barProgress, [0, 1], ['0%', '60%']);
  const bar2Height = useTransform(barProgress, [0, 1], ['0%', '75%']);
  const bar3Height = useTransform(barProgress, [0, 1], ['0%', '85%']);
  const bar4Height = useTransform(barProgress, [0, 1], ['0%', '95%']);

  const starProgress = useTransform(
    scrollYProgress,
    [0, 0.6],
    [0, 1]
  );

  // Create motion values for each star with faster sequential timing
  const star1Scale = useTransform(starProgress, [0, 0.2], [0, 1]);
  const star2Scale = useTransform(starProgress, [0.2, 0.3], [0, 1]);
  const star3Scale = useTransform(starProgress, [0.3, 0.4], [0, 1]);
  const star4Scale = useTransform(starProgress, [0.4, 0.5], [0, 1]);
  const star5Scale = useTransform(starProgress, [0.5, 0.6], [0, 1]);

  // Label animation - appears right after the last star
  const labelOpacity = useTransform(starProgress, [0.6, 0.7], [0, 1]);
  const labelY = useTransform(starProgress, [0.6, 0.7], [20, 0]);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const currentProgress = (window.scrollY / totalScroll) * 100;
      setScrollProgress(currentProgress);
      setIsScrolling(true);

      // Clear the previous timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Set a new timeout to detect when scrolling stops
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 5);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted');
  };

  const scrollToForm = () => {
    const formSection = document.getElementById('form-section');
    formSection?.scrollIntoView({ behavior: 'smooth' });
  };

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  const particlesLoaded = useCallback(async (container: ParticlesContainer | undefined) => {
    console.log(container);
  }, []);

  return (
    <Container>
      <CoralBackground />
      <ParticlesWrapper>
        <Particles
          id="tsparticles"
          init={particlesInit}
          loaded={particlesLoaded}
          options={{
            background: {
              color: {
                value: "transparent",
              },
            },
            fpsLimit: 120,
            interactivity: {
              events: {
                onClick: {
                  enable: true,
                  mode: "push",
                },
                onHover: {
                  enable: true,
                  mode: "repulse",
                },
                resize: true,
              },
              modes: {
                push: {
                  quantity: 4,
                },
                repulse: {
                  distance: 200,
                  duration: 0.4,
                },
              },
            },
            particles: {
              color: {
                value: "#0077B6",
              },
              links: {
                color: "#0077B6",
                distance: 150,
                enable: true,
                opacity: 0.4,
                width: 1,
              },
              move: {
                direction: "none",
                enable: true,
                outModes: {
                  default: "bounce",
                },
                random: false,
                speed: 1,
                straight: false,
              },
              number: {
                density: {
                  enable: true,
                  area: 800,
                },
                value: 60,
              },
              opacity: {
                value: 0.5,
              },
              shape: {
                type: "circle",
              },
              size: {
                value: { min: 1, max: 3 },
              },
            },
            detectRetina: true,
          }}
        />
      </ParticlesWrapper>
      <Content>
        <Hero>
          <Title>Scale with Expertise</Title>
          <Subtitle>Grow with Confidence</Subtitle>
          <Button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={scrollToForm}
            $scrollProgress={scrollProgress}
            $isScrolling={isScrolling}
          >
            Join Waitlist
          </Button>
        </Hero>

        <StatsSection>
          <StatsTitle>Scale Effortlessly</StatsTitle>
          <StatsContainer>
            <ChartContainer>
              <BarChart>
                <Bar
                  $height={60}
                  style={{ height: bar1Height }}
                />
                <Bar
                  $height={75}
                  style={{ height: bar2Height }}
                />
                <Bar
                  $height={85}
                  style={{ height: bar3Height }}
                />
                <Bar
                  $height={95}
                  style={{ height: bar4Height }}
                />
              </BarChart>
            </ChartContainer>

            <ChartContainer>
              <CircularChart>
                <svg width="200" height="200" viewBox="0 0 200 200">
                  <Circle
                    cx="100"
                    cy="100"
                    r="80"
                    strokeDasharray="502"
                    strokeDashoffset={useTransform(
                      circleProgress,
                      [0, 1],
                      [502, 0]
                    )}
                  />
                </svg>
                <ChartLabel>
                  {percentage}
                </ChartLabel>
              </CircularChart>
            </ChartContainer>

            <ChartContainer>
              <StarContainer>
                <StarsWrapper>
                  <Star
                    style={{
                      opacity: star1Scale,
                      transform: `scale(${star1Scale.get()})`
                    }}
                  />
                  <Star
                    style={{
                      opacity: star2Scale,
                      transform: `scale(${star2Scale.get()})`
                    }}
                  />
                  <Star
                    style={{
                      opacity: star3Scale,
                      transform: `scale(${star3Scale.get()})`
                    }}
                  />
                  <Star
                    style={{
                      opacity: star4Scale,
                      transform: `scale(${star4Scale.get()})`
                    }}
                  />
                  <Star
                    style={{
                      opacity: star5Scale,
                      transform: `scale(${star5Scale.get()})`
                    }}
                  />
                </StarsWrapper>
                <RatingLabel
                  style={{
                    opacity: labelOpacity,
                    transform: `translateY(${labelY.get()}px)`
                  }}
                >
                  User Satisfaction
                </RatingLabel>
              </StarContainer>
            </ChartContainer>
          </StatsContainer>
        </StatsSection>

        <HowItWorksSection>
          <HowItWorksTag>HOW IT WORKS</HowItWorksTag>
          <HowItWorksTitle>Data-driven insights & suggestions</HowItWorksTitle>
          <HowItWorksGrid>
            <HowItWorksRow2>
              <HowItWorksPill>Physical Examination</HowItWorksPill>
              <HowItWorksPill>Medical Imaging</HowItWorksPill>
            </HowItWorksRow2>
            <HowItWorksLines2 viewBox="0 0 600 180">
              {/* Top left to agent (L-shape: down, then right, with rounded corner) */}
              <path d="M 110 40 V 90 Q 110 100 120 100 H 300" stroke="#B3E0FB" strokeWidth="4.5" fill="none" />
              <AnimatedLightBarPath pathId="topLeft" d="M 110 40 V 90 Q 110 100 120 100 H 300" />
              {/* Top right to agent (L-shape: down, then left, with rounded corner) */}
              <path d="M 490 40 V 90 Q 490 100 480 100 H 300" stroke="#B3E0FB" strokeWidth="4.5" fill="none" />
              <AnimatedLightBarPath pathId="topRight" d="M 490 40 V 90 Q 490 100 480 100 H 300" />
              {/* Bottom left to agent (L-shape: up, then right, with rounded corner) */}
              <path d="M 170 140 V 120 Q 170 110 200 110 H 300" stroke="#B3E0FB" strokeWidth="4.5" fill="none" />
              <AnimatedLightBarPath pathId="bottomLeft" d="M 170 140 V 120 Q 170 110 200 110 H 300" />
              {/* Bottom right to agent (L-shape: up, then left, with rounded corner) */}
              <path d="M 430 140 V 120 Q 430 110 400 110 H 300" stroke="#B3E0FB" strokeWidth="4.5" fill="none" />
              <AnimatedLightBarPath pathId="bottomRight" d="M 430 140 V 120 Q 430 110 400 110 H 300" />
            </HowItWorksLines2>
            <HowItWorksAgentCenter>
              AI AGENT
            </HowItWorksAgentCenter>
            <HowItWorksRow2 style={{ marginTop: 0 }}>
              <HowItWorksPill>Chief Complaints</HowItWorksPill>
              <HowItWorksPill>Lab Reports</HowItWorksPill>
            </HowItWorksRow2>
          </HowItWorksGrid>
        </HowItWorksSection>

        <CardContainer>
          <Card $scrollProgress={scrollProgress}>
            <CardTitle>For Medical Professionals</CardTitle>
            <CardSubtitle>Scale Medical Expertise, Amplify Impact</CardSubtitle>
            <CardContent>
              Empowering expert practitioners and medical graduates with cutting-edge AI tools, 
              infrastructure, and best practices. Practice with confidence and grow with guidance 
              from day one in your career.
            </CardContent>
          </Card>

          <Card $scrollProgress={scrollProgress}>
            <CardTitle>For Institutions</CardTitle>
            <CardSubtitle>Comprehensive Healthcare Automation</CardSubtitle>
            <CardContent>
              Partnering with Schools, Colleges, Universities, and Corporate sectors to provide 
              comprehensive healthcare automation. Enhancing student wellbeing and employee health 
              through accessible medical support and streamlined health services.
            </CardContent>
          </Card>

          <Card $scrollProgress={scrollProgress}>
            <CardTitle>For Patients & Research</CardTitle>
            <CardSubtitle>Your Health Co-pilot</CardSubtitle>
            <CardContent>
              A healthcare companion that helps patients navigate their health journey. 
              Empowering medical professionals with advanced AI tools for research, 
              documentation, and evidence-based practice.
            </CardContent>
          </Card>
        </CardContainer>
        
        <FeatureHighlightsSection>
          <FeatureCard>Automates administrative work</FeatureCard>
          <FeatureCard>AI handles documentation, billing, scheduling</FeatureCard>
          <FeatureCard>Connects doctors to specialists</FeatureCard>
          <FeatureCard>AI powered symptoms checker from prognosis</FeatureCard>
          <FeatureCard>HIPAA compliant, SOC2 certified, 99.9% uptime SLA</FeatureCard>
        </FeatureHighlightsSection>
        <CTASection>
          <CTATitle>Ready to bring change to healthcare?</CTATitle>
          <CTADesc>Join exclusive pilot program and see how top clinics are using healthpilot to boost diagnostic accuracy, reduce admin load and scale your practice</CTADesc>
        </CTASection>
        <FormSection id="form-section">
          <Form onSubmit={handleSubmit}>
            <Input type="text" placeholder="Name" required />
            <Input type="email" placeholder="Email" required />
            <Input type="tel" placeholder="Phone" required />
            <Input type="text" placeholder="Institution" required />
            <TextArea placeholder="Your message" required />
            <FormButton
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              $scrollProgress={scrollProgress}
              $isScrolling={isScrolling}
            >
              Submit
            </FormButton>
          </Form>
        </FormSection>
      </Content>
    </Container>
  );
}

export default App;
