Financial Data Streaming System
A high-performance financial data processing platform built with Java, Spring Boot, Kafka, PostgreSQL/TimescaleDB, React, Docker, and AWS.
Key Features

Real-time stock price updates with sub-50ms latency using Kafka and WebSockets
Efficient processing and storage of 1M+ stock price data points
TimescaleDB integration for high-speed time-series data queries, reducing retrieval time by 40%
Responsive React frontend dashboard for real-time market tracking
Containerized microservice architecture with Docker
Scalable cloud deployment on AWS

System Architecture
Show Image
The system consists of the following components:

Data Ingestion Service: Consumes market data from external sources and publishes to Kafka topics
Data Processing Service: Processes and enriches the market data stream
Data Storage Service: Stores processed data in PostgreSQL with TimescaleDB
API Gateway: RESTful API for historical data access
WebSocket Server: Real-time data streaming to clients
React Frontend: Interactive dashboard for market visualization and analysis

Technology Stack

Backend: Java 17, Spring Boot 3.x, Spring Kafka
Messaging: Apache Kafka
Database: PostgreSQL 15 with TimescaleDB extension
Frontend: React 18, Material-UI, TradingView charts
DevOps: Docker, Docker Compose, AWS (EC2, RDS, MSK)
Testing: JUnit 5, Mockito, Jest, React Testing Library

Getting Started
Prerequisites

Java 17 or higher
Maven 3.8+
Docker and Docker Compose
Node.js 16+ and npm

Local Development Setup

Clone the repository:

bashCopygit clone https://github.com/yourusername/financial-data-streaming.git
cd financial-data-streaming

Start the infrastructure services (Kafka, PostgreSQL, etc.):

bashCopydocker-compose up -d

Run the backend services:

bashCopycd backend
./mvnw spring-boot:run

Run the frontend development server:

bashCopycd frontend
npm install
npm start

Access the application at http://localhost:3000

Performance Metrics

Processes over 1,000,000 stock price data points
Achieves sub-50ms real-time price updates
Reduces data retrieval time by 40% using TimescaleDB optimization
Supports 1000+ concurrent WebSocket connections

Deployment
The application is deployed on AWS with the following services:

EC2 instances for application services
Amazon MSK for Kafka
RDS PostgreSQL with TimescaleDB
Elastic Container Registry for Docker images
Load balancer for traffic distribution
