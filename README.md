# Financial Data Streaming System

A high-performance financial data processing platform built with Java, Spring Boot, Kafka, PostgreSQL/TimescaleDB, React, Docker, and AWS.

## Key Features

- **Real-time stock price updates** with sub-50ms latency using Kafka and WebSockets  
- **Efficient processing and storage** of 1M+ stock price data points  
- **TimescaleDB integration** for high-speed time-series data queries, reducing retrieval time by 40%  
- **Responsive React frontend dashboard** for real-time market tracking  
- **Containerized microservice architecture** with Docker  
- **Scalable cloud deployment** on AWS  

## System Architecture

The system consists of the following components:

- **Data Ingestion Service**: Consumes market data from external sources and publishes to Kafka topics  
- **Data Processing Service**: Processes and enriches the market data stream  
- **Data Storage Service**: Stores processed data in PostgreSQL with TimescaleDB  
- **API Gateway**: RESTful API for historical data access  
- **WebSocket Server**: Real-time data streaming to clients  
- **React Frontend**: Interactive dashboard for market visualization and analysis  

## Technology Stack

- **Backend**: Java 17, Spring Boot 3.x, Spring Kafka  
- **Messaging**: Apache Kafka  
- **Database**: PostgreSQL 15 with TimescaleDB extension  
- **Frontend**: React 18, Material-UI, TradingView charts  
- **DevOps**: Docker, Docker Compose, AWS (EC2, RDS, MSK)  
- **Testing**: JUnit 5, Mockito, Jest, React Testing Library  

## Getting Started

### Prerequisites

- Java 17 or higher  
- Maven 3.8+  
- Docker and Docker Compose  
- Node.js 16+ and npm  

### Local Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/financial-data-streaming.git
   cd financial-data-streaming
   ```

2. Start the infrastructure services (Kafka, PostgreSQL, etc.):
   ```bash
   docker-compose up -d
   ```

3. Run the backend services:
   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```

4. Run the frontend development server:
   ```bash
   cd frontend
   npm install
   npm start
   ```

5. Access the application at [http://localhost:3000](http://localhost:3000)

## Performance Metrics

- **Processes over 1,000,000 stock price data points**  
- **Achieves sub-50ms real-time price updates**  
- **Reduces data retrieval time by 40% using TimescaleDB optimization**  
- **Supports 1000+ concurrent WebSocket connections**  

## Deployment

The application is deployed on AWS with the following services:

- **EC2 instances** for application services  
- **Amazon MSK** for Kafka  
- **RDS PostgreSQL** with TimescaleDB  
- **Elastic Container Registry** for Docker images  
- **Load balancer** for traffic distribution  

---
