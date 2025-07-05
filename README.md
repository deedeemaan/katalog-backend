# Katalog Backend

This repository contains the backend implementation for **Katalog**, a mobile application developed as part of my bachelor's thesis. Katalog assists physical therapists in special education settings by providing tools to capture, analyze, and manage student posture data and anthropometric measurements.

## Features

* **RESTful API**: Provides endpoints for managing student data, measurements, and images.
* **Image Processing & Analysis**: AI-based analysis of images to detect body angles and identify potential posture deviations.
* **Data Persistence**: Utilizes PostgreSQL to reliably store and retrieve data.
* **User Management**: Facilitates multiple therapists collaborating within the same institution.

## Technologies Used

* **Node.js & Express**: Fast, scalable server-side development.
* **PostgreSQL**: Robust and secure relational database for persistent storage.
* **pg (node-postgres)**: Direct SQL querying for efficient interaction with the PostgreSQL database.
* **Multer**: Handling image uploads.
* **TensorFlow\.js**: AI-powered image analysis and posture detection.

## Setup & Installation

1. Clone this repository:

```bash
git clone https://github.com/deedeemaan/katalog-backend.git
```

2. Navigate into the repository:

```bash
cd katalog-backend
```

3. Install dependencies:

```bash
npm install
```

4. Set up the PostgreSQL database:

* Create a new PostgreSQL database.
* Update `.env` file with your database credentials:

```
DATABASE_URL=postgres://user:password@localhost:5432/katalog
```

5. Run database migrations:

```bash
npm run migrate
```

6. Start the backend server:

```bash
npm start
```

The backend API server will start running at `http://localhost:5000`.

## Frontend

This backend supports the [Katalog Frontend](https://github.com/yourusername/katalog-frontend) mobile application.

