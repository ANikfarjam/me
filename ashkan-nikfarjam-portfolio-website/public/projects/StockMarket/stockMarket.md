# Stock Market Management System

The Stock Market Management System is a full-stack web application built to simulate real-world trading in a safe, educational environment. It was designed to help beginner investors understand stock market dynamics without financial risk. The platform uses real S&P 500 data, enabling users to virtually buy, sell, and analyze stocks, while also providing portfolio tracking, analytics, and stock-related news updates.

## Project Objective
The goal of this application is to create a simulation-based learning tool for stock trading, catering especially to those without prior investment experience. The platform allows users to:

* Practice stock trading using virtual currency.

* Track portfolio performance over time.

* Analyze historical stock price trends.

* Stay informed with live news feeds related to financial markets.

By offering these capabilities, the application empowers users to gain confidence and develop strategies in a realistic but consequence-free trading environment.

## System Architecture and Technology Stack
The system was designed with a modular and scalable architecture, ensuring flexibility and maintainability.

**Frontend**: Built with React (JavaScript), providing a responsive and interactive user experience. Pages include the landing screen, user dashboards, stock buying/selling pages, and admin panels.

**Backend**: Flask (Python) acts as the main API layer, handling user requests, authentication, routing, and all database interactions.

**Database**: MySQL, structured with a BCNF-normalized schema to eliminate redundancy and preserve data integrity. Firebase’s Realtime Database was used for NoSQL support ticket management.

**Authentication**: Firebase Authentication integrated with both email/password and Google Auth methods.

**APIs**: Stock price data is fetched via scripts using Yahoo Finance and Finnhub APIs, handled by scheduled fetch operations and routed insertion methods.

The architecture follows a decoupled model: React sends HTTP requests to Flask endpoints, which then communicate with SQL (for core app logic and records) and Firebase (for tickets and auth sync).

## Core Features and Functionalities
### Landing Page and Market Visualization
The homepage displays interactive charts for major indices (S&P 500, NASDAQ, Dow Jones) and selected companies (e.g., Apple). Users can adjust timeframes (up to 1 year) and switch between different indices. This feature helps users become familiar with real market behavior and recent trends.

### News Aggregator
The news page displays financial headlines sorted by categories such as business, science, healthcare, and technology. Articles can be searched by keyword or company name. Unauthenticated users can still browse news, while logged-in users can save articles for later reference.

### User Registration and Authentication
New users register using their email, password, and name. The application supports Firebase Google Authentication for quick onboarding. Upon login, the system syncs Firebase-authenticated users with the SQL database to maintain a complete user profile.

### Virtual Wallet and Funds Management
Users can deposit or withdraw virtual dollars. These actions trigger real-time updates to the UserBalance table in SQL and reflect immediately in the dashboard.

Deposits are tracked in the FundsDeposit table.

Withdrawals are tracked in the FundsWithdraw table with flags for approval and clearing.

### Stock Trading Simulation
Users can:

Search and view stocks using ticker symbols, company names, or sectors.

Buy and sell whole shares (no fractional shares supported).

View 1-year historical price charts per stock.

Analyze current holdings, including:

Weighted average purchase price.

Percentage and dollar-based profit/loss.

Trade history with timestamps and transaction details.

Each stock transaction is inserted into the MarketOrder table, while real-time data is fetched by the quick_fetch script.

### Portfolio Management
Holdings are displayed in an interactive table that updates with every transaction. Metrics include:

Ticker symbol

Quantity owned

Average purchase price

Current price

Percent gain/loss

Dollar gain/loss

Users can sell shares, which updates the database and cash balance accordingly.

### Administrative Features
**Admin Dashboard**

The admin interface includes tools for:

Monitoring the storage consumption of each SQL table.

Inserting or deleting records across any table through structured forms.

Viewing a live feed of the most recent 100 database operations (insertions, deletions, updates).

Handling user support tickets submitted via the frontend. Admins can respond and update ticket statuses in real-time.

Manual SQL Row Insertion/Deletion

Admins can select any SQL table, insert data via dynamically generated input fields (based on table structure), and send JSON payloads to the backend for insertion. Deletion uses a similar process and updates the table view post-operation.

**Log Monitoring**

A dedicated view shows all admin-side insertions, deletions, and updates, aiding in audit trails and debugging. Data is fetched from the Log table in MySQL.

## Data Fetching and Backend Pipeline
Two key scripts maintain the stock data backend:

main_fetch.py:

Gathers full historical data for each S&P 500 company.

Inserts into Stock, StockPrice, and Sector tables.

Fetches from Yahoo Finance and falls back to Finnhub.

Converts timestamps to Pacific Time.

quick_fetch.py:

Used for daily updates.

Only fetches and inserts prices not yet stored.

Designed to avoid redundant API calls.

Database functions in database.py abstract all SQL operations, ensuring modular and reusable logic across routes.




## Database Design and Schema
The schema adheres to Boyce-Codd Normal Form (BCNF), increasing data integrity but introduced complexity in query formulation and foreign key handling.

Firebase Authentication was easier to integrate than anticipated, and it significantly streamlined security concerns.


