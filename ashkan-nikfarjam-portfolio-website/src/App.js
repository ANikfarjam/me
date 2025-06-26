import React, { useState, useEffect, Component } from 'react';
import { FaGithub, FaLinkedin, FaEnvelope, FaPhoneAlt } from 'react-icons/fa';
import { Link, Element } from 'react-scroll';
import portfolio_img from './assets/portpic.jpg';
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
import TriangleMesh from './components/triablemesh'
// import geneScope_md from './projects/GeneScope/GeneScope.md?raw'
import './App.css';

function App() {
  // for selectin specific project
  const [selectedProject, setSelectedProject] = useState(null);

  // genescope project
  const [geneScopeContent, setGeneScopeContent] = useState('');
  useEffect(() => {
    fetch(`${process.env.PUBLIC_URL}/projects/GeneScope/GeneScope.md`)
      .then(res => res.text())
      .then(setGeneScopeContent);
  }, []);
  // stairCase project
  const [stairCaseContent, setstairCaseContent] = useState('');
  useEffect(() => {
    fetch(`${process.env.PUBLIC_URL}/projects/StairCase/StairCase.md`)
      .then(res => res.text())
      .then(setstairCaseContent);
  }, []);

  // xray image project
  const [xrayContent, setxrayContent] = useState('');
  useEffect(() => {
    fetch(`${process.env.PUBLIC_URL}/projects/xRayImage/xray.md`)
      .then(res => res.text())
      .then(setxrayContent);
  }, []);

  //genequest project contents
  const [geneQuestContent, setgeneQuestContent] = useState('');
  useEffect(() => {
    fetch(`${process.env.PUBLIC_URL}/projects/geneQuest/geneQuest.md`)
      .then(res => res.text())
      .then(setgeneQuestContent);
  }, []);

  //stockMarket
  const [stockMarketContent, setstockMarketContent] = useState('');
  useEffect(() => {
    fetch(`${process.env.PUBLIC_URL}/projects/StockMarket/stockMarket.md`)
      .then(res => res.text())
      .then(setstockMarketContent);
  }, []);

  //germanPlus
  const [gemanCityContent, setgemanCityContent] = useState('');
  useEffect(() => {
    fetch(`${process.env.PUBLIC_URL}/projects/German/german.md`)
      .then(res => res.text())
      .then(setgemanCityContent);
  }, []);
  //connect4
  const [connect4Content, setconnect4Content] = useState('');
  useEffect(() => {
    fetch(`${process.env.PUBLIC_URL}/projects/connect4/connect4.md`)
      .then(res => res.text())
      .then(setconnect4Content);
  }, []);

  //heathmap
  const [healthMapContent, sethealthMapContent] = useState('');
  useEffect(() => {
    fetch(`${process.env.PUBLIC_URL}/projects/healthmap/healthmap.md`)
      .then(res => res.text())
      .then(sethealthMapContent);
  }, []);

  //creating project images
  const geneScopeImages = [
    'https://raw.githubusercontent.com/ANikfarjam/AshkanNikfarjam.github.io/main/ashkan-nikfarjam-portfolio-website/public/projects/GeneScope/media/catMLP.png',
    'https://raw.githubusercontent.com/ANikfarjam/AshkanNikfarjam.github.io/main/ashkan-nikfarjam-portfolio-website/public/projects/GeneScope/media/AHP.png',
    'https://raw.githubusercontent.com/ANikfarjam/AshkanNikfarjam.github.io/main/ashkan-nikfarjam-portfolio-website/public/projects/GeneScope/media/Catboos.png',
    'https://raw.githubusercontent.com/ANikfarjam/AshkanNikfarjam.github.io/main/ashkan-nikfarjam-portfolio-website/public/projects/GeneScope/media/cox.png'
  ];

  const stairCaseImages = [
    'https://raw.github.com/ANikfarjam/AshkanNikfarjam.github.io/main/ashkan-nikfarjam-portfolio-website/public/projects/StairCase/media/landing.png',
    'https://raw.github.com/ANikfarjam/AshkanNikfarjam.github.io/main/ashkan-nikfarjam-portfolio-website/public/projects/StairCase/media/dashboard.png',
    'https://raw.github.com/ANikfarjam/AshkanNikfarjam.github.io/main/ashkan-nikfarjam-portfolio-website/public/projects/StairCase/media/login.png',
    'https://raw.github.com/ANikfarjam/AshkanNikfarjam.github.io/main/ashkan-nikfarjam-portfolio-website/public/projects/StairCase/media/menue.png',
    'https://raw.github.com/ANikfarjam/AshkanNikfarjam.github.io/main/ashkan-nikfarjam-portfolio-website/public/projects/StairCase/media/game.png',
    'https://raw.github.com/ANikfarjam/AshkanNikfarjam.github.io/main/ashkan-nikfarjam-portfolio-website/public/projects/StairCase/media/langchain.png'
  ];

  const xrayImages = [
    'https://raw.github.com/ANikfarjam/AshkanNikfarjam.github.io/main/ashkan-nikfarjam-portfolio-website/public/projects/xRayImage/image/intro.png',
    'https://raw.github.com/ANikfarjam/AshkanNikfarjam.github.io/main/ashkan-nikfarjam-portfolio-website/public/projects/xRayImage/image/dataprocessing.png',
    'https://raw.github.com/ANikfarjam/AshkanNikfarjam.github.io/main/ashkan-nikfarjam-portfolio-website/public/projects/xRayImage/image/mainmodel.png',
    'https://raw.github.com/ANikfarjam/AshkanNikfarjam.github.io/main/ashkan-nikfarjam-portfolio-website/public/projects/xRayImage/image/NAS.png',
    'https://raw.github.com/ANikfarjam/AshkanNikfarjam.github.io/main/ashkan-nikfarjam-portfolio-website/public/projects/xRayImage/image/classificationReport.png',
    'https://raw.github.com/ANikfarjam/AshkanNikfarjam.github.io/main/ashkan-nikfarjam-portfolio-website/public/projects/xRayImage/image/comparison.png'
    
  ];

  const genequestImges = [
    'https://raw.github.com/ANikfarjam/AshkanNikfarjam.github.io/main/ashkan-nikfarjam-portfolio-website/public/projects/geneQuest/media/GenBank.jpeg',
    'https://raw.github.com/ANikfarjam/AshkanNikfarjam.github.io/main/ashkan-nikfarjam-portfolio-website/public/projects/geneQuest/media/allignment.jpeg',
    'https://raw.github.com/ANikfarjam/AshkanNikfarjam.github.io/main/ashkan-nikfarjam-portfolio-website/public/projects/geneQuest/media/conservative.jpeg'
  ];

  const stockMarketImges = [
    'https://raw.github.com/ANikfarjam/AshkanNikfarjam.github.io/main/ashkan-nikfarjam-portfolio-website/public/projects/StockMarket/media/landingPage.png',
    'https://raw.github.com/ANikfarjam/AshkanNikfarjam.github.io/main/ashkan-nikfarjam-portfolio-website/public/projects/StockMarket/media/login.png',
    'https://raw.github.com/ANikfarjam/AshkanNikfarjam.github.io/main/ashkan-nikfarjam-portfolio-website/public/projects/StockMarket/media/news.png',
    'https://raw.github.com/ANikfarjam/AshkanNikfarjam.github.io/main/ashkan-nikfarjam-portfolio-website/public/projects/StockMarket/media/stocks.png',
    'https://raw.github.com/ANikfarjam/AshkanNikfarjam.github.io/main/ashkan-nikfarjam-portfolio-website/public/projects/StockMarket/media/admin.png',
    'https://raw.github.com/ANikfarjam/AshkanNikfarjam.github.io/main/ashkan-nikfarjam-portfolio-website/public/projects/StockMarket/media/instert.png',
    'https://raw.github.com/ANikfarjam/AshkanNikfarjam.github.io/main/ashkan-nikfarjam-portfolio-website/public/projects/StockMarket/media/logs.png'
  ];

  const germanImges = [
    'https://raw.github.com/ANikfarjam/AshkanNikfarjam.github.io/main/ashkan-nikfarjam-portfolio-website/public/projects/German/media/image.png',
    'https://raw.github.com/ANikfarjam/AshkanNikfarjam.github.io/main/ashkan-nikfarjam-portfolio-website/public/projects/German/media/image1.png',
    'https://raw.github.com/ANikfarjam/AshkanNikfarjam.github.io/main/ashkan-nikfarjam-portfolio-website/public/projects/German/media/image2.png',
    'https://raw.github.com/ANikfarjam/AshkanNikfarjam.github.io/main/ashkan-nikfarjam-portfolio-website/public/projects/German/media/image3.png',
    'https://raw.github.com/ANikfarjam/AshkanNikfarjam.github.io/main/ashkan-nikfarjam-portfolio-website/public/projects/German/media/image4.png',
    'https://raw.github.com/ANikfarjam/AshkanNikfarjam.github.io/main/ashkan-nikfarjam-portfolio-website/public/projects/German/media/mlPage.png'
  ];
  

  const connect4Imges = [
    'https://raw.github.com/ANikfarjam/AshkanNikfarjam.github.io/main/ashkan-nikfarjam-portfolio-website/public/projects/connect4/media/game.jpeg'
  ];
  const healthmapImeges = ['https://raw.github.com/ANikfarjam/AshkanNikfarjam.github.io/main/ashkan-nikfarjam-portfolio-website/public/projects/healthMap/image/healthmap.jpeg'];

  const sections = [
    {
      id: 'Ashkan Nikfarjam',
      // title: 'Ashkan Nikfarjam',
      content: (
        <div className="section-content">
          <div className="profile-container">
            <div className="profile-text">
              <h1>Ashkan Nikfarjam</h1>
              <ul>
                <li>Data Scientist and Full Stack Developer.</li>
                <li>San Jose State University, Class of 2025</li>
              </ul>
              <div className="contact-icons">
                <a href="https://github.com/ANikfarjam" target="_blank" rel="noopener noreferrer">
                  <FaGithub size={24} />
                </a>
                <a href="https://www.linkedin.com/in/ashkan-nikfarjam/" target="_blank" rel="noopener noreferrer">
                  <FaLinkedin size={24} />
                </a>
                <div className="contact-item">
                  <FaEnvelope size={24} />
                  <span>ashkan_nikfarjam@yahoo.com</span>
                </div>
                {/* <div className="contact-item">
                  <FaPhoneAlt size={24} />
                  <span>+1 (408) 843-0173</span>
                </div> */}
              </div>

            </div>
            <div className="profile-image">
              <img src={portfolio_img} alt="Ashkan Nikfarjam" className="profile-img" />
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'about',
      // title: 'About Me',
      content: (
        <div className="about-content">
          <h1>
            About me
          </h1>
          <p>
          {/* Hi! Im Ashkan Nikfarjam, a recent Data Science graduate from San Jose State University who specializes in building AI-powered solutions and orchestrating large language models (LLMs). 
          With a strong foundation in AI powered solutions, full-stack web development, interactive data dashboard design, and cloud deployment to create innovative, data-driven applications. 
          My portfolio highlights include GeneScope (a deep learning and multimodal AI platform for biomedical research featuring an LLM-powered chatbot built with LangChain and a Pinecone vector database), StairCase (a cross platform multiplyer game with AI-driven trivia and hangman mini-games leveraging LangChain agents), stock market virtual trading platform 
          that showcases my full-stack development and real-time system integration skills. 
          I am proficient with both SQL and NoSQL databases (such as Firebase Realtime Database and Firestore) 
          and exceptionally proficient in deploying applications to the cloud, making me a confident and collaborative engineer 
          ready to tackle complex challenges. */}
          Hi! I’m Ashkan Nikfarjam, a recent Data Science graduate from San Jose State University with a strong foundation in AI-powered solutions, full-stack web development, and interactive data dashboard design. I’m passionate about building intelligent systems—whether it’s machine learning applications, LLM-driven tools, or robotics side projects that explore automation and control. As a classically trained violinist, I also bring a deep sense of discipline, creativity, and structure to my technical work.
        </p>
        </div>
      )
    },
    {
      id: 'projects',
      content: (
        <div className='projects-container'>
          <h1>My Projects</h1>
          <p className="projects-intro">
            Here is a collection of my projects showcasing my skills in data science, AI, and full-stack development.
          </p>
          <div className="project-cards">
            {[
              {
                name: 'GeneScope',
                description: 'A deep learning platform for biomedical research that classifies breast cancer stages using multimodal data and integrates an LLM-powered chatbot.',
                image: genescope_icon,
                imageGallery: geneScopeImages,
                detailedDescription:  <ReactMarkdown>{geneScopeContent}</ReactMarkdown>
              },
              {
                name: 'X-ray-Image_classification_CNNRNN',
                description: 'An X-ray image classifier using a CNN-RNN hybrid model to detect and classify bone fractures.',
                image: xrayImg,
                imageGallery: xrayImages,
                detailedDescription: <ReactMarkdown>{xrayContent}</ReactMarkdown>
              },
              {
                name: 'StairCase',
                description: 'A cross-platform multiplayer game with AI-driven trivia and hangman mini-games using LangChain agents.',
                image: staircaseImg,
                imageGallery:stairCaseImages,
                detailedDescription: <ReactMarkdown>{stairCaseContent}</ReactMarkdown>
              },
              {
                name: 'GeneQuest',
                description: 'A Genomic reasearch web app that unify BLAST, GenBank search, and phylogenetic tools into one simple interface',
                image: geneQuestIcon,
                imageGallery:genequestImges,
                detailedDescription: <ReactMarkdown>{geneQuestContent}</ReactMarkdown>
              },
              {
                name: 'MokeTheStock',
                description: 'A full-stack web application built to simulate real-world trading.',
                image: stockMarketLogo,
                imageGallery:stockMarketImges,
                detailedDescription: <ReactMarkdown>{stockMarketContent}</ReactMarkdown>
              },
              {
                name: 'CityPlus(Germany)',
                description: 'A  recommendation web app design to recommend a city in Germany tailored to the users preferances.',
                image: germanyIcon,
                imageGallery:germanImges,
                detailedDescription: <ReactMarkdown>{gemanCityContent}</ReactMarkdown>
              },
              {
                name: 'Connect4',
                description: 'A single player Connect4 game where players play against an AI agent.',
                image: connect4Icon,
                imageGallery:connect4Imges,
                detailedDescription: <ReactMarkdown>{connect4Content}</ReactMarkdown>
              },
              {
                name: 'HealthMap',
                description: 'An intractive Data Visualization dashboard, anlysing most common raspitory desease across the US.',
                image: healthmapIcon,
                imageGallery:healthmapImeges,
                detailedDescription: <ReactMarkdown>{healthMapContent}</ReactMarkdown>
              },

            ].map((project) => (
              <div key={project.name} className="project-card">
                <div className="project-image">
                  <img src={project.image} alt={project.name} className="project-img" />
                </div>
                <h3>{project.name.replace(/_/g, ' ')}</h3>
                <p>{project.description}</p>
                <button onClick={() => setSelectedProject(project)}>View Details</button>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'Experience',
      title: 'My Experience',
      content: (
        <WorkExperienceTimeline />
      )
    },
    {
      id: 'Education',
      title: '',
      content: (
        <div className="edu-content">
          <h1>Education</h1>
          <div style={{ lineHeight: '1.6' }}>
            <h2>San Jose State University</h2>
            <p><strong>B.S. in Data Science</strong></p>
            <p>Aug 2023 – May 2025</p>

            <h2>City College of San Francisco</h2>
            <p><strong>Transfer A.A. in Mathematics, GPA: 3.88</strong></p>
            <p>Jan 2012 – May 2023</p>

            <h2>Mission College</h2>
            <p><strong>CCNA (Cisco Certified Network Administrator) – Certificate of Completion</strong></p>
            <p>2018</p>
          </div>
        </div>
      )
    },
     {
      id: 'Intrests and side projects',
      title: '',
      content: (
        <div class='side-projects'>
          <p>
            I constantly seek out new developments in AI and Machine Learning to sharpen my expertise. As a data scientist and someone who believes in using AI to drive innovation, I’ve honed my skills across various domains, from biomedical research to intelligent systems. Beyond theoretical understanding, I actively explore cutting-edge tools like deep learning frameworks, generative models, and reinforcement learning. I’m particularly drawn to the creative and engineering challenges AI presents—whether it's building intelligent agents, developing real-world applications, or contributing to open-source projects that push the boundaries of what's possible with machine intelligence.
          </p>
          <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
            <iframe 
              width="640" 
              height="360" 
              src="https://www.youtube.com/embed/Ijg3eVuZ8A0" 
              title="ML Animation"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
            <p style={{ maxWidth: '640px', margin: '1rem auto', color: '#fff' }}>
              I created this animation for a Machine Learning assignment at SJSU. The goal was to illustrate how neural probabilistic models mitigate dimensionality issues and handle unseen words better than traditional n-gram models.
            </p>
          </div>
          <p>
            My background in IT and computer hardware has deepened my passion for engineering, especially where it intersects with artificial intelligence. I love hands-on creation and have developed a strong interest in robotics. I've completed several Arduino-based projects, including building a mechanical arm to assist with soldering PCB boards. I particularly enjoyed the engineering process, from sketching initial designs and 3D printing components to wiring circuits and programming servo motors. It felt like assembling a complex, rewarding puzzle. I also designed a device that uses an ultrasonic sensor to measure distances, further fueling my curiosity about potential limitless applications of robotics and AI.
          </p>
          <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
            <iframe 
              src="https://www.youtube.com/embed/1q5wo_WGUrQ" 
              width="640" 
              height="360" 
              style={{ border: 'none', overflow: 'hidden' }} 
              scrolling="no" 
              frameBorder="0" 
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
            <p style={{ maxWidth: '640px', margin: '1rem auto', color: '#fff' }}>
              This was the first prototype of my Arduino-based mechanical arm project. It was designed to assist with soldering tasks and controlled using servo motors and ultrasonic sensors.
            </p>
          </div>
        </div>
      )
     }
  ];

  return (
    <>
      <TriangleMesh />
      {selectedProject && (
        <div className="modal-overlay" onClick={() => setSelectedProject(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{selectedProject.name.replace(/_/g, ' ')}</h2>
            {/* Image slider here */}
            <ImageSlider images={selectedProject.imageGallery} />
            <div className="markdown-body">
              {selectedProject.detailedDescription}
            </div>
            <button onClick={() => setSelectedProject(null)}>Close</button>
          </div>
        </div>
      )}

      {/* <div className="bg" /> */}
      <nav className="nav">
        {sections.map(section => (
          <Link
            key={section.id}
            to={section.id}
            smooth
            duration={200}
            className="nav-link"
          >
            {section.id.charAt(0).toUpperCase() + section.id.slice(1)}
          </Link>
        ))}
      </nav>
      <div className="content">
        {sections.map(section => (
          <Element key={section.id} name={section.id} className="section">
            <h2>{section.title}</h2>
            {section.content}
          </Element>
        ))}
      </div>
    </>
  );
}

export default App;
