# Billing System

A comprehensive billing and inventory management system built with Django and React.

## Project Overview

This system is designed to streamline the billing process, manage customer data, and track products. It features a modern, responsive frontend and a robust backend API.

## Tech Stack

### Backend
- **Framework:** Django & Django REST Framework
- **Database:** SQLite (Development)
- **Language:** Python

### Frontend
- **Framework:** React with Vite
- **State Management:** Redux Toolkit
- **Styling:** Tailwind CSS
- **Language:** TypeScript

## Project Structure

```text
Billing/
├── backend/            # Django application
│   ├── apps/           # Custom Django apps (customers, products, etc.)
│   ├── billing_system/ # Core project configuration
│   └── manage.py       # Django management script
├── frontend/           # React application
│   ├── src/            # Source code
│   └── vite.config.ts  # Vite configuration
└── .gitignore          # Root gitignore file
```

## Setup Instructions

### Backend Setup
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # Windows:
   .\venv\Scripts\activate
   # Unix/macOS:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run migrations:
   ```bash
   python manage.py migrate
   ```
5. Start the development server:
   ```bash
   python manage.py runserver
   ```

### Frontend Setup
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
