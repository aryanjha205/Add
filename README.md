# Centralized Ads Management Platform

A production-ready, high-performance advertisement management system built with Flask, MongoDB Atlas, and a modern glassmorphic frontend.

## 🚀 Key Features

- **Centralized Admin Dashboard**: Full CRUD (Create, Read, Update, Delete) for managing advertisements.
- **RESTful API**: Secure endpoints for cross-domain ad consumption.
- **Dynamic Ad Panel**: A ready-to-use client-side panel that fetches ads in real-time.
- **Premium Aesthetics**: Modern UI with glassmorphism, fluid animations, and responsive design.
- **Tracking & Analytics**: Built-in support for tracking impressions and clicks.
- **MongoDB Atlas Integration**: Scalable cloud database storage.
- **CORS Enabled**: Ready for use across multiple external websites.

## 🛠️ Tech Stack

- **Backend**: Python (Flask)
- **Database**: MongoDB Atlas
- **Frontend**: Vanilla HTML5, CSS3 (Modern features), ES6+ JavaScript
- **Styling**: Custom CSS with HSL variables and glassmorphism.

## 📁 Project Structure

```text
├── app.py                # Flask Backend & REST API
├── .env                  # Environment Variables
├── requirements.txt      # Python Dependencies
├── static/
│   ├── css/
│   │   └── style.css     # Premium UI Styles
│   └── js/
│       ├── admin.js      # Admin Dashboard Logic
│       └── client.js     # Client Ad Rendering & Tracking
└── templates/
    ├── admin.html        # Admin Interface
    └── index.html        # Client Demo Page
```

## ⚙️ Setup Instructions

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Database Configuration**:
   The application uses MongoDB Atlas. Ensure the `MONGO_URI` in the `.env` file is correct (already configured with your provided URI).

3. **Run the Application**:
   ```bash
   python app.py
   ```
   The platform will be available at `http://localhost:5000`.

## 📡 API Documentation

### Public API (GET Active Ads)
`GET /api/ads`
Returns a JSON list of all currently active ads.

### Tracking (POST)
- `POST /api/ads/<id>/click`: Increment click count.
- `POST /api/ads/<id>/impression`: Increment impression count.

### Admin API (CRUD)
- `GET /api/admin/ads`: List all ads.
- `POST /api/admin/ads`: Create new ad.
- `PUT /api/admin/ads/<id>`: Update existing ad.
- `DELETE /api/admin/ads/<id>`: Delete an ad.

## 🎨 Implementation Notes

- **Aesthetics**: The UI uses an 'Outfit' typography from Google Fonts and a dark-mode palette with vibrant gradients.
- **Scalability**: The MongoDB schema includes fields for clicks and impressions, allowing for future growth into a full analytics suite.
- **Flexibility**: The `client.js` can be easily adapted into a standalone script tag for integration into third-party websites.
