import { useState, useEffect } from 'react';
import { FaGithub, FaLinkedin, FaEnvelope, FaExternalLinkAlt } from 'react-icons/fa';
import { IoDocuments } from "react-icons/io5";
import { Link, Element } from 'react-scroll';
import portfolio_img from './assets/portpic2.jpg';
import genescope_icon from './assets/genescope.ico';
import xrayImg from './assets/xray.png';
import staircaseImg from './assets/staircase.jpeg';
import stockMarketLogo from './assets/stockMarket.png';
import geneQuestIcon from './assets/geneQuest.jpg';
import germanyIcon from './assets/germany.jpg';
import connect4Icon from './assets/connect4.png';
import healthmapIcon from './assets/healthmap.png';
import ReactMarkdown from 'react-markdown';
import ImageSlider from './components/imageSlider';
import WorkExperienceTimeline from './components/workexperience';
import AnimatedBackground from './components/AnimatedBackground';
import Chatbot from './components/chatbot';
import './App.css';

const ROLES = [
  'Data Scientist',
  'Full Stack Developer',
  'ML Engineer',
  'AI Systems Builder',
];

function useTypewriter(words, typingSpeed = 80, deletingSpeed = 40, pauseMs = 1800) {
  const [displayed, setDisplayed] = useState('');
  const [wordIdx, setWordIdx] = useState(0);
  const [typing, setTyping] = useState(true);

  useEffect(() => {
    const current = words[wordIdx];
    if (typing) {
      if (displayed.length < current.length) {
        const t = setTimeout(() => setDisplayed(current.slice(0, displayed.length + 1)), typingSpeed);
        return () => clearTimeout(t);
      }
      const t = setTimeout(() => setTyping(false), pauseMs);
      return () => clearTimeout(t);
    } else {
      if (displayed.length > 0) {
        const t = setTimeout(() => setDisplayed(displayed.slice(0, -1)), deletingSpeed);
        return () => clearTimeout(t);
      }
      setWordIdx((wordIdx + 1) % words.length);
      setTyping(true);
    }
  }, [displayed, typing, wordIdx, words, typingSpeed, deletingSpeed, pauseMs]);

  return displayed;
}

function App() {
  useEffect(() => {
    document.title = 'Ashkan Nikfarjam';
  }, []);

  // Scroll reveal
  useEffect(() => {
    const els = document.querySelectorAll('.section');
    const io = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.07 }
    );
    els.forEach((el, i) => {
      if (i === 0) el.classList.add('visible');
      else io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  const displayedRole = useTypewriter(ROLES);

  const [selectedProject, setSelectedProject] = useState(null);

  // Markdown content fetches
  const [geneScopeContent, setGeneScopeContent] = useState('');
  const [stairCaseContent, setstairCaseContent] = useState('');
  const [xrayContent, setxrayContent] = useState('');
  const [geneQuestContent, setgeneQuestContent] = useState('');
  const [stockMarketContent, setstockMarketContent] = useState('');
  const [gemanCityContent, setgemanCityContent] = useState('');
  const [connect4Content, setconnect4Content] = useState('');
  const [healthMapContent, sethealthMapContent] = useState('');

  useEffect(() => {
    fetch(`${process.env.PUBLIC_URL}/projects/GeneScope/GeneScope.md`).then(r => r.text()).then(setGeneScopeContent);
  }, []);
  useEffect(() => {
    fetch(`${process.env.PUBLIC_URL}/projects/StairCase/stairCase.md`).then(r => r.text()).then(setstairCaseContent);
  }, []);
  useEffect(() => {
    fetch(`${process.env.PUBLIC_URL}/projects/xRayImage/xray.md`).then(r => r.text()).then(setxrayContent);
  }, []);
  useEffect(() => {
    fetch(`${process.env.PUBLIC_URL}/projects/geneQuest/geneQuest.md`).then(r => r.text()).then(setgeneQuestContent);
  }, []);
  useEffect(() => {
    fetch(`${process.env.PUBLIC_URL}/projects/StockMarket/stockMarket.md`).then(r => r.text()).then(setstockMarketContent);
  }, []);
  useEffect(() => {
    fetch(`${process.env.PUBLIC_URL}/projects/German/german.md`).then(r => r.text()).then(setgemanCityContent);
  }, []);
  useEffect(() => {
    fetch(`${process.env.PUBLIC_URL}/projects/connect4/connect4.md`).then(r => r.text()).then(setconnect4Content);
  }, []);
  useEffect(() => {
    fetch(`${process.env.PUBLIC_URL}/projects/healthMap/healthmap.md`).then(r => r.text()).then(sethealthMapContent);
  }, []);

  // Image galleries
  const geneScopeImages = [
    'https://raw.githubusercontent.com/ANikfarjam/AshkanNikfarjam.github.io/main/ashkan-nikfarjam-portfolio-website/public/projects/GeneScope/media/catMLP.png',
    'https://raw.githubusercontent.com/ANikfarjam/AshkanNikfarjam.github.io/main/ashkan-nikfarjam-portfolio-website/public/projects/GeneScope/media/AHP.png',
    'https://raw.githubusercontent.com/ANikfarjam/AshkanNikfarjam.github.io/main/ashkan-nikfarjam-portfolio-website/public/projects/GeneScope/media/Catboos.png',
    'https://raw.githubusercontent.com/ANikfarjam/AshkanNikfarjam.github.io/main/ashkan-nikfarjam-portfolio-website/public/projects/GeneScope/media/cox.png',
  ];
  const stairCaseImages = [
    'https://raw.github.com/ANikfarjam/AshkanNikfarjam.github.io/main/ashkan-nikfarjam-portfolio-website/public/projects/StairCase/media/landing.png',
    'https://raw.github.com/ANikfarjam/AshkanNikfarjam.github.io/main/ashkan-nikfarjam-portfolio-website/public/projects/StairCase/media/dashboard.png',
    'https://raw.github.com/ANikfarjam/AshkanNikfarjam.github.io/main/ashkan-nikfarjam-portfolio-website/public/projects/StairCase/media/login.png',
    'https://raw.github.com/ANikfarjam/AshkanNikfarjam.github.io/main/ashkan-nikfarjam-portfolio-website/public/projects/StairCase/media/menue.png',
    'https://raw.github.com/ANikfarjam/AshkanNikfarjam.github.io/main/ashkan-nikfarjam-portfolio-website/public/projects/StairCase/media/game.png',
    'https://raw.github.com/ANikfarjam/AshkanNikfarjam.github.io/main/ashkan-nikfarjam-portfolio-website/public/projects/StairCase/media/langchain.png',
  ];
  const xrayImages = [
    'https://raw.github.com/ANikfarjam/AshkanNikfarjam.github.io/main/ashkan-nikfarjam-portfolio-website/public/projects/xRayImage/image/intro.png',
    'https://raw.github.com/ANikfarjam/AshkanNikfarjam.github.io/main/ashkan-nikfarjam-portfolio-website/public/projects/xRayImage/image/dataprocessing.png',
    'https://raw.github.com/ANikfarjam/AshkanNikfarjam.github.io/main/ashkan-nikfarjam-portfolio-website/public/projects/xRayImage/image/mainmodel.png',
    'https://raw.github.com/ANikfarjam/AshkanNikfarjam.github.io/main/ashkan-nikfarjam-portfolio-website/public/projects/xRayImage/image/NAS.png',
    'https://raw.github.com/ANikfarjam/AshkanNikfarjam.github.io/main/ashkan-nikfarjam-portfolio-website/public/projects/xRayImage/image/classificationReport.png',
    'https://raw.github.com/ANikfarjam/AshkanNikfarjam.github.io/main/ashkan-nikfarjam-portfolio-website/public/projects/xRayImage/image/comparison.png',
  ];
  const genequestImges = [
    'https://raw.github.com/ANikfarjam/AshkanNikfarjam.github.io/main/ashkan-nikfarjam-portfolio-website/public/projects/geneQuest/media/GenBank.jpeg',
    'https://raw.github.com/ANikfarjam/AshkanNikfarjam.github.io/main/ashkan-nikfarjam-portfolio-website/public/projects/geneQuest/media/allignment.jpeg',
    'https://raw.github.com/ANikfarjam/AshkanNikfarjam.github.io/main/ashkan-nikfarjam-portfolio-website/public/projects/geneQuest/media/conservative.jpeg',
  ];
  const stockMarketImges = [
    'https://raw.github.com/ANikfarjam/AshkanNikfarjam.github.io/main/ashkan-nikfarjam-portfolio-website/public/projects/StockMarket/media/landingPage.png',
    'https://raw.github.com/ANikfarjam/AshkanNikfarjam.github.io/main/ashkan-nikfarjam-portfolio-website/public/projects/StockMarket/media/login.png',
    'https://raw.github.com/ANikfarjam/AshkanNikfarjam.github.io/main/ashkan-nikfarjam-portfolio-website/public/projects/StockMarket/media/news.png',
    'https://raw.github.com/ANikfarjam/AshkanNikfarjam.github.io/main/ashkan-nikfarjam-portfolio-website/public/projects/StockMarket/media/stocks.png',
    'https://raw.github.com/ANikfarjam/AshkanNikfarjam.github.io/main/ashkan-nikfarjam-portfolio-website/public/projects/StockMarket/media/admin.png',
    'https://raw.github.com/ANikfarjam/AshkanNikfarjam.github.io/main/ashkan-nikfarjam-portfolio-website/public/projects/StockMarket/media/instert.png',
    'https://raw.github.com/ANikfarjam/AshkanNikfarjam.github.io/main/ashkan-nikfarjam-portfolio-website/public/projects/StockMarket/media/logs.png',
  ];
  const germanImges = [
    'https://raw.github.com/ANikfarjam/AshkanNikfarjam.github.io/main/ashkan-nikfarjam-portfolio-website/public/projects/German/media/image.png',
    'https://raw.github.com/ANikfarjam/AshkanNikfarjam.github.io/main/ashkan-nikfarjam-portfolio-website/public/projects/German/media/image1.png',
    'https://raw.github.com/ANikfarjam/AshkanNikfarjam.github.io/main/ashkan-nikfarjam-portfolio-website/public/projects/German/media/image2.png',
    'https://raw.github.com/ANikfarjam/AshkanNikfarjam.github.io/main/ashkan-nikfarjam-portfolio-website/public/projects/German/media/image3.png',
    'https://raw.github.com/ANikfarjam/AshkanNikfarjam.github.io/main/ashkan-nikfarjam-portfolio-website/public/projects/German/media/image4.png',
    'https://raw.github.com/ANikfarjam/AshkanNikfarjam.github.io/main/ashkan-nikfarjam-portfolio-website/public/projects/German/media/mlPage.png',
  ];
  const connect4Imges = [
    'https://raw.github.com/ANikfarjam/AshkanNikfarjam.github.io/main/ashkan-nikfarjam-portfolio-website/public/projects/connect4/media/game.jpeg',
  ];
  const healthmapImeges = [
    'https://raw.github.com/ANikfarjam/AshkanNikfarjam.github.io/main/ashkan-nikfarjam-portfolio-website/public/projects/healthMap/image/healthmap.jpeg',
  ];

  const sections = [
    {
      id: 'Ashkan Nikfarjam',
      content: (
        <div className="section-content">
          <div className="profile-container">
            <div className="profile-text">
              <h1>Ashkan Nikfarjam</h1>
              <p className="hero-subtitle">
                <span className="typewriter">{displayedRole}</span>
                <span className="cursor" aria-hidden="true" />
              </p>
              <ul>
                <li>San Jose State University — Data Science, Class of 2025</li>
                <li>Building AI systems at Stanford School of Medicine Genomic Lab</li>
              </ul>
              <div className="contact-icons">
                <a href="https://github.com/ANikfarjam" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                  <FaGithub size={20} /> GitHub
                </a>
                <a href="https://www.linkedin.com/in/ashkan-nikfarjam/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                  <FaLinkedin size={20} /> LinkedIn
                </a>
                <div className="contact-item">
                  <FaEnvelope size={20} />
                  <span>ashkan_nikfarjam@yahoo.com</span>
                </div>
                <a
                  href="https://raw.githubusercontent.com/ANikfarjam/me/main/ashkan-nikfarjam-portfolio-website/backend/pinecone_local/Docs/resume/Ashkan%20Nikfajram_SW26.pdf"
                  download="Ashkan_Nikfarjam_Resume.pdf"
                  className="contact-item"
                >
                  <IoDocuments size={20} />
                  <span>Resume</span>
                </a>
              </div>
            </div>

            <div className="profile-image">
              <div className="profile-glow" />
              <div className="profile-img-wrapper">
                <div className="profile-img-inner">
                  <img src={portfolio_img} alt="Ashkan Nikfarjam" className="profile-img" />
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'about',
      content: (
        <div className="about-content">
          <h1>About Me</h1>
          <p>
            Hi, I'm Ashkan Nikfarjam, a Data Science graduate and software engineer working at the
            intersection of machine learning, research, and production systems.
          </p>
          <p>
            My current work involves building scalable AI-powered pipelines for genomic analysis,
            including real-time variant scoring, automated data validation, and reproducible ML
            workflows deployed across cloud environments. More broadly, I'm interested in applying
            AI and machine learning to complex research problems, translating advanced models into
            reliable, production-ready systems that can be used beyond the lab.
          </p>
          <p>
            I'm particularly drawn to areas where deep learning, data engineering, and scientific
            inquiry converge — whether in biomedical research, applied AI platforms, or
            industry-scale intelligent systems.
          </p>
        </div>
      ),
    },
    {
      id: 'skills',
      content: (
        <div className="skills-content">
          <h1>Skills</h1>
          <div className="skills-grid">
            {[
              { category: 'Languages',             skills: ['C++', 'Java', 'Python', 'JavaScript (React)', 'TypeScript', 'HTML', 'CSS', 'shadcn/ui', 'MUI'] },
              { category: 'Agents & Protocols',    skills: ['Model Context Protocol (MCP)', 'LangChain', 'LangGraph', 'LangSmith'] },
              { category: 'ML Frameworks',         skills: ['Scikit-Learn', 'PyTorch', 'TensorFlow', 'Keras', 'Vaex'] },
              { category: 'Data Libraries',        skills: ['Pandas', 'Seaborn', 'Matplotlib', 'Plotly', 'BeautifulSoup', 'Dash', 'Marimo', 'Jupyter'] },
              { category: 'Databases & ORMs',      skills: ['SQLite', 'MySQL', 'SQLAlchemy', 'Firebase RealTime DB', 'FireStore DB'] },
              { category: 'Cloud & DevOps',        skills: ['DockerHub', 'GitHub', 'Kubernetes', 'GCP (Compute Engine, Cloud Composer, Pub/Sub, BigQuery)', 'Vercel', 'Render', 'Azure (Cloud Storage, VMs)'] },
              { category: 'APIs & Backend',        skills: ['REST APIs', 'FastAPI', 'Flask', 'Pydantic', 'Auth0'] },
              { category: 'Workflow & Orchestration', skills: ['Dagster', 'Prefect', 'Terraform'] },
            ].map(({ category, skills }) => (
              <div key={category} className="skill-card">
                <h3 className="skill-category">{category}</h3>
                <div className="skill-tags">
                  {skills.map(skill => (
                    <span key={skill} className="skill-tag">{skill}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 'Experience',
      content: <WorkExperienceTimeline />,
    },
    {
      id: 'projects',
      content: (
        <div className="projects-container">
          <h1>My Projects</h1>
          <div className="project-cards">
            {[
              {
                name: 'GeneScope',
                links: ['https://gene-scope-liard.vercel.app/', 'https://github.com/ANikfarjam/GeneScope'],
                description: 'A deep learning platform for biomedical research that classifies patient clinical and genomic data into breast cancer stages using a multimodal model and integrates an LLM-powered chatbot.',
                image: genescope_icon,
                imageGallery: geneScopeImages,
                detailedDescription: <ReactMarkdown>{geneScopeContent}</ReactMarkdown>,
              },
              {
                name: 'X-ray Image Classification CNN-RNN',
                links: ['https://github.com/ANikfarjam/X-ray-Image_classification_CNNRNN'],
                description: 'An X-ray image classifier built on a CNN-RNN hybrid model that detects and classifies bone fractures, while also identifying the type of bone (e.g., hand, leg).',
                image: xrayImg,
                imageGallery: xrayImages,
                detailedDescription: <ReactMarkdown>{xrayContent}</ReactMarkdown>,
              },
              {
                name: 'StairCase',
                links: ['https://stair-case.vercel.app/', 'https://github.com/ANikfarjam/StairCase'],
                description: 'A cross-platform multiplayer game with LLM-driven trivia and hangman mini-games using LangChain agents.',
                image: staircaseImg,
                imageGallery: stairCaseImages,
                detailedDescription: <ReactMarkdown>{stairCaseContent}</ReactMarkdown>,
              },
              {
                name: 'GeneQuest',
                links: ['https://github.com/ANikfarjam/GeneQuest'],
                description: 'A genomic research web app that unifies BLAST, GenBank search, and phylogenetic tools into one simple interface.',
                image: geneQuestIcon,
                imageGallery: genequestImges,
                detailedDescription: <ReactMarkdown>{geneQuestContent}</ReactMarkdown>,
              },
              {
                name: 'MockTheStock',
                links: ['https://github.com/ryanfernald/Stock-Market-Management-System'],
                description: 'A full-stack web application built to simulate real-world trading and create stock portfolios.',
                image: stockMarketLogo,
                imageGallery: stockMarketImges,
                detailedDescription: <ReactMarkdown>{stockMarketContent}</ReactMarkdown>,
              },
              {
                name: 'CityPlus (Germany)',
                links: ['https://github.com/ANikfarjam/Germany-City-Plus-Kmean-Clustering-ML-Learing-and-Rulebase-AI'],
                description: "An AI-powered web application that recommends cities in Germany based on the user's personal preferences.",
                image: germanyIcon,
                imageGallery: germanImges,
                detailedDescription: <ReactMarkdown>{gemanCityContent}</ReactMarkdown>,
              },
              {
                name: 'Connect4',
                links: ['https://github.com/ANikfarjam/Connect4'],
                description: 'A single player Connect4 game where players play against an AI agent.',
                image: connect4Icon,
                imageGallery: connect4Imges,
                detailedDescription: <ReactMarkdown>{connect4Content}</ReactMarkdown>,
              },
              {
                name: 'HealthMap',
                links: ['https://github.com/ANikfarjam/HealthMap'],
                description: 'An interactive data visualization dashboard analyzing the most common respiratory diseases across the U.S.',
                image: healthmapIcon,
                imageGallery: healthmapImeges,
                detailedDescription: <ReactMarkdown>{healthMapContent}</ReactMarkdown>,
              },
            ].map((project) => (
              <div key={project.name} className="project-card">
                <div className="project-image">
                  <img src={project.image} alt={project.name} className="project-img" />
                </div>
                <h3>{project.name}</h3>
                <div className="project-links">
                  {project.links.map((link) => (
                    <a key={link} href={link} target="_blank" rel="noopener noreferrer" className="link-icon">
                      {link.includes('github.com') ? <FaGithub size={18} /> : <FaExternalLinkAlt size={16} />}
                    </a>
                  ))}
                </div>
                <p>{project.description}</p>
                <button onClick={() => setSelectedProject(project)}>View Details</button>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 'Education',
      content: (
        <div className="edu-content">
          <h1>Education</h1>
          <div className="edu-cards">
            <div className="edu-card">
              <h2>San Jose State University</h2>
              <p className="edu-degree">B.S. in Data Science</p>
              <p className="edu-date">Aug 2023 – May 2025</p>
            </div>
            <div className="edu-card">
              <h2>City College of San Francisco</h2>
              <p className="edu-degree">Transfer A.A. in Mathematics &nbsp;·&nbsp; GPA: 3.88</p>
              <p className="edu-date">Jan 2012 – May 2023</p>
            </div>
            <div className="edu-card">
              <h2>Mission College</h2>
              <p className="edu-degree">CCNA (Cisco Certified Network Administrator) — Certificate of Completion</p>
              <p className="edu-date">2018</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'Interests and Side Projects',
      content: (
        <div className="side-projects">
          <h1>Interests &amp; Side Projects</h1>
          <p>
            I constantly seek out new developments in AI and Machine Learning to sharpen my expertise.
            As a data scientist and someone who believes in using AI to drive innovation, I've honed my
            skills across various domains, from biomedical research to intelligent systems. Beyond
            theoretical understanding, I actively explore cutting-edge tools like deep learning
            frameworks, generative models, and reinforcement learning. I'm particularly drawn to the
            creative and engineering challenges AI presents — whether it's building intelligent agents,
            developing real-world applications, or contributing to open-source projects that push the
            boundaries of what's possible with machine intelligence.
          </p>
          <div style={{ textAlign: 'center' }}>
            <iframe
              width="640"
              height="360"
              src="https://www.youtube.com/embed/Ijg3eVuZ8A0"
              title="ML Animation"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            <p style={{ maxWidth: '640px', margin: '1rem auto' }}>
              I created this animation for a Machine Learning assignment at SJSU to illustrate how
              neural probabilistic models address the curse of dimensionality and handle unseen words
              more effectively than traditional n-gram models.
            </p>
          </div>
          <p>
            My background in IT and computer hardware has deepened my passion for engineering,
            especially where it intersects with artificial intelligence. I love hands-on creation and
            have developed a strong interest in robotics. I've completed several Arduino-based projects,
            including building a mechanical arm to assist with soldering PCB boards. I particularly
            enjoyed the engineering process — from sketching initial designs and 3D printing components
            to wiring circuits and programming servo motors. It felt like assembling a complex,
            rewarding puzzle. I also designed a device that uses an ultrasonic sensor to measure
            distances, further fueling my curiosity about the limitless applications of robotics and AI.
          </p>
          <div style={{ textAlign: 'center' }}>
            <iframe
              src="https://www.youtube.com/embed/1q5wo_WGUrQ"
              width="640"
              height="360"
              style={{ border: 'none', overflow: 'hidden' }}
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              allowFullScreen
            />
            <p style={{ maxWidth: '640px', margin: '1rem auto' }}>
              This was the first prototype of my Arduino-based mechanical arm project, designed to
              assist with soldering tasks and controlled using servo motors and other components.
            </p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <>
      <AnimatedBackground />

      {selectedProject && (
        <div className="modal-overlay" onClick={() => setSelectedProject(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{selectedProject.name}</h2>
            <ImageSlider images={selectedProject.imageGallery} />
            <div className="markdown-body">
              {selectedProject.detailedDescription}
            </div>
            <button onClick={() => setSelectedProject(null)}>Close</button>
          </div>
        </div>
      )}

      <nav className="nav">
        <span className="nav-brand">A.Nikfarjam</span>
        <div className="nav-links">
          {sections.map(section => (
            <Link
              key={section.id}
              to={section.id}
              smooth
              duration={220}
              className="nav-link"
            >
              {section.id.charAt(0).toUpperCase() + section.id.slice(1)}
            </Link>
          ))}
        </div>
      </nav>

      <div className="content">
        {sections.map(section => (
          <Element key={section.id} name={section.id} className="section">
            {section.content}
          </Element>
        ))}
      </div>

      <Chatbot />
    </>
  );
}

export default App;
