import React from 'react';
import { Link, Element } from 'react-scroll';
import portfolio_img from './assets/portpic.jpg'
import './App.css';

function App() {
  const sections = [
    {
      id: 'Ashkan Nikfarjam',
      // title: 'Ashkan Nikfarjam',
      content: (
        <div className="section-content">
          <div className="profile-container">
            <div className="profile-text">
              <h1>
                Ashkan Nikfarjam
              </h1>
              <ul>
                <li>Data Scientist and Full Stack Developer.</li>
                <li>San Jose State University, Class of 2025</li>
              </ul>
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
          Hi! Im Ashkan Nikfarjam, a recent Data Science graduate from San Jose State University who specializes in building AI-powered solutions and orchestrating large language models (LLMs). 
          With a strong foundation in AI powered solutions, full-stack web development, interactive data dashboard design, and cloud deployment to create innovative, data-driven applications. 
          My portfolio highlights include GeneScope (a deep learning and multimodal AI platform for biomedical research featuring an LLM-powered chatbot built with LangChain and a Pinecone vector database), StairCase (a cross platform multiplyer game with AI-driven trivia and hangman mini-games leveraging LangChain agents), stock market virtual trading platform 
          that showcases my full-stack development and real-time system integration skills. 
          I am proficient with both SQL and NoSQL databases (such as Firebase Realtime Database and Firestore) 
          and exceptionally proficient in deploying applications to the cloud, making me a confident and collaborative engineer 
          ready to tackle complex challenges.
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
                description: 'A deep learning platform for biomedical research that classifies breast cancer stages using multimodal data and integrates an LLM-powered chatbot.'
              },
              {
                name: 'X-ray-Image_classification_CNNRNN',
                description: 'An X-ray image classifier using a CNN-RNN hybrid model to detect and classify bone fractures.'
              },
              {
                name: 'StairCase',
                description: 'A cross-platform multiplayer game with AI-driven trivia and hangman mini-games using LangChain agents.'
              },
              {
                name: 'AudioCNN',
                description: 'A convolutional neural network model trained to classify audio segments, focusing on piano notes and performance analysis.'
              },
              {
                name: 'AshkanNikfarjam.github.io',
                description: 'My personal portfolio website showcasing projects, skills, and contact information.'
              },
              {
                name: 'Stock_Market_Management_System',
                description: 'A virtual stock trading platform with real-time data integration, Firebase authentication, and admin dashboard.'
              },
              {
                name: 'GeneQuest',
                description: 'A bioinformatics tool that performs multiple sequence alignment and builds phylogenetic trees for DNA sequences.'
              },
              {
                name: 'Connect4',
                description: 'An unbeatable Connect4 AI game using Minimax search with alpha-beta pruning and a utility-based agent.'
              },
              {
                name: 'SciKitLearn-SanJose-Neighbohood-Recomendation',
                description: 'A recommendation system that suggests neighborhoods in San Jose using k-means clustering and rule-based filtering.'
              },
              {
                name: 'Germany-City-Plus-Kmean-Clustering-ML-Learing-and-Rulebase-AI',
                description: 'A machine learning pipeline that uses K-means clustering to recommend German cities for immigrants.'
              },
              {
                name: 'HealthMap',
                description: 'A health-focused data visualization app using real-world health metrics and interactive charts.'
              },
              {
                name: 'cs131',
                description: 'A class project exploring foundational data structures and algorithms using C++ and Python.'
              }
            ].map((project) => (
              <div key={project.name} className="project-card">
                <div className="project-image">
                  <img src="#" alt={project.name} className="project-img" />
                </div>
                <h3>{project.name.replace(/_/g, ' ')}</h3>
                <p>{project.description}</p>
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
        <p>
          I have worked at several tech companies, specializing in frontend development and data visualization.
        </p>
      )
    },
    {
      id: 'Contact',
      title: 'Get in Touch',
      content: (
        <p>
          Email me at <a href="mailto:ashkan@example.com">ashkan@example.com</a> to collaborate!
        </p>
      )
    }
  ];

  return (
    <>
      <div className="bg" />
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
