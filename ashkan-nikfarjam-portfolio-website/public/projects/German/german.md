# Germany City+: AI-Powered Travel & Relocation Recommender
Germany City+ is an intelligent, data-driven web application designed to help users—whether tourists, students, or professionals discover optimal German cities based on their personal goals. Through data visualization, machine learning, and hybrid AI agents, the app explores Germany’s cultural and economic landscape while providing personalized travel and relocation recommendations.

## Project Objective

The core goal of Germany City+ was to build a smart assistant for users navigating the diversity of German cities. Germany has stark regional differences (e.g., East vs. West) across education, economy, housing, and well-being, which can make travel or relocation decisions complex.

This application guides users by:

* Offering informative state/city-level visualizations.

* Providing smart recommendations tailored to the user's goals.

## Stack & Architecture
Frontend: Dash, built with a navbar-routing system and interactive graphs

Backend: Python scripts (KMeans, AI logic), Flask for routing

Data: OECD indicators, scraped rental data, bootstrap-resampled data for better classification

ML Model: K-Means clustering for grouping similar states (optimal K=3)

AI Agent: Combines rule-based logic and semantic networks to map user responses to clustered cities

## Key Features
Geo & State Analysis: Compare regional trends (East vs. West Germany)

Rental Estimator: Uses KNN imputation to fill in missing price data

ML Explorer: Inertia plots and cluster visualizations

Recommendation Engine:

User fills out a form describing their priorities (affordability, jobs, education, etc.)

Agent identifies matching clusters, retrieves relevant cities

Returns personalized city suggestions