# Skill Evidence ATS — Frontend Web App

This is the React + TypeScript frontend web application for the **Skill Evidence ATS** system, powered by Vite.

## Features
- **Recruiter Dashboard**: Interactive view of candidate metrics, capabilities, and social signal audits.
- **Job Analyzer**: Workspace for pasting and parsing job description texts.
- **Resume Parser & Auditor**: Detailed extraction tool showing evidence verification for candidates' claimed skills.
- **Weight Sandbox**: Recruiter configuration module allowing instant, weight-adjusted score calculations.
- **Batch Sandbox & Evaluator**: Bulk uploads and server-side processing for candidate pools up to 100K profiles. Features include:
  - Dual modes: Direct Browser Upload (safety capped at 10MB) vs. Server-side Streaming.
  - Interactive custom Job Description pasting & automatic requirement weights extraction.
  - Complete pagination, skeleton loaders, and results summary statistics.
  - Clean CSV exporter fully compliant with the challenge rules.

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Setup & Run
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Access the web app at `http://localhost:5173`.

---

## 💡 AI Transparency Note
In the interest of professional integrity and engineering transparency, I want to state clearly that **Google Antigravity** (Google DeepMind's advanced agentic coding assistant) was utilized during the design, implementation, and optimization of this project.

This choice was not due to a lack of technical knowledge or programming capability, but rather to maximize efficiency. Translating complex conceptual ideas into a production-ready system within a compressed hackathon timeline is a major constraint. Using AI allowed me to quickly prototype, test, and iterate on my ideas in real-time. System design is fundamentally a process of trial and error, and using Google Antigravity helped streamline this cycle, reduce formatting/boilerplate errors, and deliver a robust solution in the limited time available. I believe in utilizing modern tools to build better software, and I am proud of the hybrid human-AI engineering process used to bring this system to life.

