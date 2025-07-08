# 📋 Task Manager Application

A full-stack **task management** web application built with **React** (frontend) and **Node.js/Express + MongoDB** (backend).

This app helps users manage daily tasks, track progress, and gain insights via an analytics dashboard — all in a clean, responsive UI.

---

## 🚀 Features

- 🔐 User Authentication (JWT-based login & registration)
- ✅ Task CRUD (Create, Read, Update, Delete)
- 📂 Filter & Sort Tasks
- 📅 Daily Check-in Tracker
- 📊 Analytics Dashboard
- 📱 Mobile-Responsive Design

---

![image](https://github.com/user-attachments/assets/4935ad4d-f7e4-49aa-b204-b87403f60f6e)


## 🛠️ Tech Stack

### Frontend
- React
- Tailwind CSS
- Axios

### Backend
- Node.js
- Express.js
- MongoDB (with Mongoose)
- JWT (JSON Web Token)

---

## 🧑‍💻 Getting Started

### 🔧 Prerequisites
- Node.js
- MongoDB account (or local MongoDB setup)

### 📦 Installation

```bash
# Clone the repo
git clone https://github.com/obedav/Task-Manager.git

# Install backend dependencies
cd Task-Manager/backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

```

# Production Deployment Checklist

Before deploying to production, make sure to:

- [ ] Set your real domain in `frontend/index.html` (canonical, OG, manifest, etc.)
- [ ] Set your real API URL in Vite config and environment variables
- [ ] Set `VITE_ENVIRONMENT` to 'production' in your environment
- [ ] Set `JWT_SECRET` and `MONGODB_URI` in your backend environment
- [ ] Restrict CORS in backend to your frontend domain
- [ ] Integrate error reporting (e.g., Sentry) in both frontend and backend
- [ ] Ensure all favicon and icon files exist in `public/`
- [ ] Use HTTPS for all production traffic
- [ ] Test PWA install and offline mode
- [ ] Monitor logs and uptime after deployment
