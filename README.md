# Surplus Depot - Inventory Management System

A full-stack inventory management application built with React, Express, and PostgreSQL, demonstrating modern web development practices and deployment strategies.

🔗 **Live Demo:** [https://surplus-depot.vercel.app](https://surplus-depot.vercel.app/login)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Dependencies](#dependencies)
- [Build](#build)
- [Deployment](#deployment)
- [Database Schema](#database-schema)



## 🎯Overview

Surplus Depot is a comprehensive inventory management system designed to help businesses track products, manage variants (colors, sizes), and monitor stock levels. The application features role-based access control, real-time inventory updates, and a responsive user interface.


## ✨Features

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


## 🛠Tech Stack

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

### Deployed 
- **Vercel** - Frontend hosting
- **Render** - Backend hosting
- **Supabase** - Database and PostgREST API


## 🏗Architecture

```text
┌─────────────────┐
│   Frontend      │
│   (Vercel)      │
│   React + Vite  │
└────────┬────────┘
          │
          │ HTTPS
          │
┌────────▼────────┐
│   Backend       │
│   (Render)      │
│   Express API   │
└────────┬────────┘
          │
          │ PostgREST
          │
┌────────▼────────┐
│   Database      │
│   (Supabase)    │
│   PostgreSQL    │
└─────────────────┘
```



### Data Flow
1. **Frontend** → User interacts with React UI
2. **Backend** → Express API handles authentication and business logic
3. **PostgREST** → RESTful interface to PostgreSQL
4. **Database** → PostgreSQL stores all data with triggers and functions


## 📦Dependencies

1. **Frontend Dependencies**
```json
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
```
2. **Backend Dependencies**

```json
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
```

## 🧱Build


### System Requirements
	•	Node.js: 18.x or higher
	•	npm: 9.x or higher
	•	PostgreSQL: 14.x or higher (via Docker for local development)
	•	Docker: 20.x or higher (for local development)
	•	Git: 2.x or higher

### Quick Start

1. **Clone The Repository:**

   ```bash
   git clone https://github.com/MyronHolmes/inventory-manager.git
   cd inventory-manager

3. **Navigate To Project Root:**
	
	```bash
	cd inventory-manager

4. **Frontend: Install Dependencies:**
	
	```bash
	npm install

5. **Backend: Install Dependencies:**
	
	```bash
	cd private
	npm install
	cd ..
	
6. **Frontend: Set Up ENV Variables In Root:**
	```env
	VITE_API=http://localhost:4000
	
7. ## Backend Dependencies

	```json
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


8. **Start Docker Services:**
	
	```bash
	docker-compose up -d

 9. **Start Development Servers:**
	- ### Terminal 1 - Frontend

		```bash
		npm rub dev

	- ### Terminal 2 - Backend

		```bash
		cd private
		nodemon server.js

	- ### Terminal 3 - Database

		```bash
		npm run start:dev
	  
10. **Build For Production**

	```bash
	npm run build

11. **Preview Production Build Locally**

	```bash
	npm run preview

12. **Run Production Server**
	
	```bash
	npm start


## 🚀Deployment

### Production Deployment
This application is deployed using:

**Frontend (Vercel)**
- Automatic deployments from `main` branch
- Live URL: https://surplus-depot.vercel.app

**Backend (Render)**
- Automatic deployments from `main` branch
- API URL: https://surplus-depot-backend.onrender.com

**Database (Supabase)**
- PostgreSQL with PostgREST API
- Managed backups and scaling

### Environment Variables

1. **Production Frontend (Vercel):**

	```env
	VITE_API=https://surplus-depot-backend.onrender.com

2. **Production Backend (Render):**

	```env
	NODE_ENV=production
	PORT=10000
	PGRST_URL=https://your-project.supabase.co/rest/v1/
	SUPABASE_ANON_KEY=your-key
	JWT_SECRET=your-secret


## 🗄️Database Schema

### **Core Tables**
	•	users - User accounts with role-based access
	•	categories - Product categories
	•	colors - Available color variants
	•	sizes - Available size variants
	•	products - Main product catalog
	•	product_variants - Specific product variations (color + size)
	
### **Key Features**
	•	UUID primary keys
	•	Automatic timestamps via triggers
	•	Audit trail (created_by, updated_by)
	•	Row Level Security (RLS) policies
	•	Cascade deletes for data integrity
