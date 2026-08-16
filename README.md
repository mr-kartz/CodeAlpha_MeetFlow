# 🎥 MeetFlow

A real-time video conferencing and collaboration platform built using modern web technologies.

MeetFlow allows users to create and join meeting rooms, communicate through real-time chat, share files, collaborate using a whiteboard, and participate in real-time video meetings.

---

## 🚀 Features

### 🎥 Real-Time Video Conferencing
- Create and join meeting rooms
- Real-time peer-to-peer video communication
- Multiple participant support
- Participant identification
- Camera and microphone controls

### 💬 Real-Time Chat
- Instant messaging between meeting participants
- Messages delivered using Socket.IO
- Real-time communication inside meeting rooms

### 🖥️ Screen Sharing
- Share your screen with other participants
- Control screen sharing directly from the meeting interface

### 📝 Collaborative Whiteboard
- Interactive whiteboard for collaboration
- Useful for explanations, discussions, and brainstorming

### 📁 File Sharing
- Upload and share files inside meetings
- Access shared files from the meeting interface

### 👥 Participant Management
- View participants in the meeting
- Online participant status
- Host identification
- Participant count

### 👑 Host Controls
- Host identification
- Meeting management controls
- Participant-related controls

### 🔐 Authentication
- User registration and login
- Protected routes
- JWT-based authentication

### 📄 Room Management
- Create meeting rooms
- Join existing rooms
- Room ID based meeting access

---

## 🛠️ Tech Stack

### Frontend
- React.js
- Vite
- JavaScript
- HTML5
- CSS3
- Socket.IO Client
- PeerJS

### Backend
- Node.js
- Express.js
- Socket.IO
- PeerJS
- JWT Authentication

### Database
- MongoDB
- Mongoose

### Development Tools
- Visual Studio Code
- Git
- GitHub
- npm

---

## 📁 Project Structure

```text
MeetFlow/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── socket/
│   ├── uploads/
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md

⚙️ Installation :

1. Clone the repository
git clone https://github.com/mr-kartz/CodeAlpha_MeetFlow.git
2. Navigate to the project
cd CodeAlpha_MeetFlow

🔧 Backend Setup :

Open a terminal inside the backend folder:

cd backend

Install dependencies:

npm install

Create a .env file inside the backend folder.

Example:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

Start the backend:

npm run dev

💻 Frontend Setup :

Open another terminal:

cd frontend

Install dependencies:

npm install

Start the frontend:

npm run dev

🌐 Application:

After starting both servers, open the frontend URL provided by Vite.

Example:
http://localhost:5173

🔐 Environment Variables :

Sensitive configuration values such as:

MongoDB connection string
JWT secret
Environment-specific configuration

are stored in .env and excluded from Git using .gitignore.

A .env.example file is provided to show the required configuration format.

🔄 How MeetFlow Works
User
  │
  ▼
React Frontend
  │
  ├──────────────► Express Backend
  │                    │
  │                    ├── Authentication
  │                    ├── Room Management
  │                    ├── File Sharing
  │                    └── MongoDB
  │
  ├──────────────► Socket.IO
  │                    │
  │                    └── Real-Time Communication
  │
  └──────────────► PeerJS
                       │
                       └── Real-Time Video Communication

🎯 Project Goals :

The main goal of MeetFlow is to provide a simple and collaborative platform for real-time online meetings.

The project combines:

Video communication
Real-time messaging
Screen sharing
File sharing
Collaborative tools
User authentication
Meeting room management

into a single platform.

🚀 Future Improvements :

Possible future improvements include:
📱 Improved mobile experience
☁️ Cloud deployment
🔔 Meeting notifications
📅 Meeting scheduling
🎙️ Advanced audio controls
🔒 Additional meeting security
📊 Meeting analytics
🤖 AI-powered meeting assistance

👨‍💻 Author :
Karthick M R
B.Tech Artificial Intelligence and Data Science Student

⭐ Support :
If you find this project useful, consider giving the repository a ⭐ on GitHub.
---

# 5.3 Save the file
Press:

```text
Ctrl + S

Then look at your VS Code Explorer.

It should look approximately like:

📁 MEETFLOW
│
├── 📁 backend
├── 📁 frontend
├── 📄 .gitignore
└── 📄 README.md