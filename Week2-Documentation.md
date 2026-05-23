# Week 2 Documentation – Nexus Platform

## Milestone 3: Meeting Scheduling
- Built meeting scheduling API
- Schedule, accept, reject meetings
- Conflict detection implemented
- Meeting data stored in MongoDB
- Frontend connected to backend

## Milestone 4: Video Calling
- Implemented WebRTC signaling server
- Used Socket.IO for real-time communication
- Features: Join room, toggle audio/video, end call
- Frontend video call page created

## Milestone 5: Document Processing
- Built document upload API using Multer
- Store document metadata in MongoDB
- File upload/download/delete working
- E-signature storage implemented
- Frontend documents page connected

## APIs Built
- POST /api/meetings
- GET /api/meetings
- PUT /api/meetings/:id/accept
- PUT /api/meetings/:id/reject
- POST /api/documents/upload
- GET /api/documents
- DELETE /api/documents/:id
- PUT /api/documents/:id/sign