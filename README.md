# Nexus Platform - Investor & Entrepreneur Collaboration

## Project Overview
Nexus is a full-stack web application that connects investors with entrepreneurs.

## Features
- Authentication (JWT-based login/register)
- Role-based dashboards (Investor & Entrepreneur)
- Meeting Scheduling
- Video Calling (WebRTC + Socket.IO)
- Document Management with e-signature
- Payment System (deposit/withdraw/transfer)
- Security (bcrypt, JWT, 2FA OTP)

## Tech Stack
- Frontend: React + TypeScript + Vite + TailwindCSS
- Backend: Node.js + Express
- Database: MongoDB Atlas
- Real-time: Socket.IO
- Deployment: Vercel (Frontend)

## Setup Instructions

### Backend
1. cd backend
2. npm install
3. Create .env file with:
   - MONGO_URI=your_mongodb_uri
   - JWT_SECRET=your_secret
   - PORT=5000
4. npm run dev

### Frontend
1. npm install
2. npm run dev

## API Documentation
Postman Collection: [Your Postman Link Here]
## Live Demo
Frontend: https://nexus-main.vercel.app
Backend: Runs locally on port 5000

## How to run backend:
1. cd backend
2. npm install
3. Add .env file (see .env.example)
4. npm run dev
## GitHub Repository
https://github.com/Samavia-Awan/Nexus-main