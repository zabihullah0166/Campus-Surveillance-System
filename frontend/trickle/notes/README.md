# AI-Based Campus Surveillance System

## Overview
A web-based dashboard for an AI-powered smart surveillance system designed for universities. It monitors student behavior, detects prohibited activities (fighting, smoking, etc.), and integrates with student databases for automated disciplinary actions.

## Features
- **Live Camera Feeds**: Real-time monitoring grid.
- **History & Analytics**: Detailed reports filtered by Today, Week, Month, Semester, Year, or Specific Date.
- **Incident Logging**: Real-time listing of detected infractions.

## Tech Stack
- Frontend: HTML, React, TailwindCSS
- Icons: Lucide
- Charts: Chart.js

## Local Development / VS Code Setup

To run this project locally in Visual Studio Code:

1.  **Create Project Folder**: Create a new folder on your computer named `campus-surveillance`.
2.  **Replicate Structure**: Inside this folder, create the following file structure to match the project:
    *   `index.html`
    *   `app.js`
    *   `components/` (folder)
        *   `Sidebar.js`
        *   `Header.js`
        *   `LiveMonitor.js`
        *   `HistoryDashboard.js`
    *   `utils/` (folder)
        *   `mockData.js`
3.  **Copy Code**: Copy the code from each file in this dashboard into the corresponding file on your computer.
4.  **Run with Live Server**:
    *   Open VS Code and install the **"Live Server"** extension (by Ritwick Dey).
    *   Right-click on `index.html`.
    *   Select **"Open with Live Server"**.