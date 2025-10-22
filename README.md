# Surplus Depot - Inventory Management System

A full-stack inventory management application built with React, Express, and PostgreSQL, demonstrating modern web development practices and deployment strategies.

🔗 **Live Demo:** [https://surplus-depot.vercel.app](https://surplus-depot.vercel.app/login)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Dependencies](#dependencies)
- [Build & Deployment](#build--deployment)



## 🎯 Overview

Surplus Depot is a comprehensive inventory management system designed to help businesses track products, manage variants (colors, sizes), and monitor stock levels. The application features role-based access control, real-time inventory updates, and a responsive user interface.


## ✨ Features

- **User Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (Admin, Manager, Staff)
  - Secure password hashing with bcrypt

- **Inventory Management**
  - Product catalog with categories
  - Product variants (colors, sizes)
  - Real-time quantity tracking
  - Automatic status updates (active, inactive, out of stock)

- **User Management**
  - Create, read, update, and delete users
  - Role assignment and permissions
  - User activity tracking

- **Data Management**
  - CRUD operations for:
    - Products
    - Categories
    - Colors
    - Sizes
    - Product Variants
  - Bulk operations support
  - Data validation and error handling

- **UI/UX**
  - Responsive design
  - Interactive data tables with AG Grid
  - Real-time filtering and sorting
  - Toast notifications for user feedback


## 🛠 Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router v6** - Client-side routing
- **AG Grid** - Advanced data tables
- **Tailwind CSS** - Utility-first styling
- **React Hot Toast** - Notifications

### Backend
- **Node.js** - Runtime environment
- **Express 5** - Web framework
- **PostgREST** - RESTful API layer
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **CORS** - Cross-origin resource sharing

### Database
- **PostgreSQL** - Relational database
- **Supabase** - Database hosting and PostgREST API

### Deployment
- **Vercel** - Frontend hosting
- **Render** - Backend hosting
- **Supabase** - Database and PostgREST API


## 🏗 Architecture
┌───────────────┐
│ Frontend │ (Vercel)
│ React + Vite │
└──────┬────────┘
│ HTTPS
┌──────▼────────┐
│ Backend │ (Render)
│ Express API │
└──────┬────────┘
│ PostgREST
┌──────▼────────┐
│ Database │ (Supabase)
│ PostgreSQL │
└───────────────┘


### Data Flow
1. **Frontend** → User interacts with React UI
2. **Backend** → Express API handles authentication and business logic
3. **PostgREST** → RESTful interface to PostgreSQL
4. **Database** → PostgreSQL stores all data with triggers and functions


## Dependencies
## 📦 Dependencies

### Frontend Dependencies

    ```
    {
      "dependencies": {
        "react": "^18.3.1",
        "react-dom": "^18.3.1",
        "react-router-dom": "^6.28.0",
        "ag-grid-community": "^32.3.3",
        "ag-grid-react": "^32.3.3",
        "react-hot-toast": "^2.4.1"
      },
      "devDependencies": {
        "@vitejs/plugin-react": "^4.3.4",
        "vite": "^6.0.1",
        "eslint": "^9.15.0",
        "tailwindcss": "^3.4.15",
        "postcss": "^8.4.49",
        "autoprefixer": "^10.4.20"
      }
    }

### Backend Dependencies

    ```
    {
      "dependencies": {
        "express": "^5.1.0",
        "bcrypt": "^6.0.0",
        "cors": "^2.8.5",
        "dotenv": "^16.5.0",
        "jsonwebtoken": "^9.0.2",
        "pg": "^8.16.0"
      },
      "devDependencies": {
        "nodemon": "^3.1.10"
      }
    }


## 🧱 Build & Deployment


### System Requirements
	•	Node.js: 18.x or higher
	•	npm: 9.x or higher
	•	PostgreSQL: 14.x or higher (via Docker for local development)
	•	Docker: 20.x or higher (for local development)
	•	Git: 2.x or higher

### Local Development Build
<ins>**Frontend Build:**</ins>

**Navigate to project root**
cd inventory-manager

**Install dependencies**
npm install

**Run development server (with hot reload)**
npm run dev

**Build for production**
npm run build

**Preview production build locally**
npm run preview

<ins>**Backend Build:**</ins>

**Navigate to backend directory**
cd private

**Install dependencies**
npm install

**Run development server (with nodemon)**
npm run dev

**Run production server**
npm start

1. Clone the repo:
	```
	git clone https://github.com/MyronHolmes/inventory-manager.git
2. Install dependencies:
	```
	cd inventory-manager
	npm install
3. Configure environment variables:
	```
	• DATABASE_URL=postgres://user:password@localhost:5432/mydb
	• AG_GRID_LICENSE=your-license-key
	• JWT_SECRET=your-secret-key
4. Start backend:
	```
	npm run dev:backend
5. Start frontend:
	```
	npm run dev:frontend
6. Open http://localhost:5173

Deployment

- **Frontend (Vercel)**: [[https://your-frontend.vercel.app](https://surplus-depot.vercel.app/login)  
  The main user-facing application.

- **Backend (Render)**: [[https://your-backend.onrender.com](https://surplus-depot-backend.onrender.com)
  API server powering the frontend.

- **Database (Supabase)**: [https://app.supabase.com/project/your-project-id](https://supabase.com/dashboard/project/hdjauznlahayksvylrrg)  
  PostgreSQL database (only for developers; not publicly accessible for production).
