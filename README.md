# 👋😆 Panny Your AI Companion 👋😆

Welcome to **Panny** your AI Companion, an empathetic AI companion designed to support users through warm, non-judgmental conversation and personal journaling. Panny focuses on listening, asking gentle follow-up questions, and helping users reflect — it is not a substitute for professional care. For safety, the assistant encourages users to seek immediate professional help and resources if they indicate self-harm or crisis.

## Screenshots

![Screenshot of Panny Home Page](/HomePage.png)
<br>

## 🛠️ Features

- **Empathetic Chat** — A warm, supportive conversational agent that asks gentle follow-ups and does not diagnose.
- **Personal Journals** — Keep private journal entries and review past sessions for reflection.
- **Authentication** — Email/password signup and secure session handling.
- **Privacy & Security** — Designed with secure session cookies and privacy-focused defaults.

## Technologies Used

- **Frontend**: React.js (TypeScript), Vite, Tailwind CSS
- **Backend**: Python Flask
- **AI**: PyTorch, Transformer, Unsloth, Hugging Space
- **Database**: Supabase

## Installation

If you want to run this project locally, follow these steps:

1. Clone the repository:
   ```bash
   git clone github.com/kndehh/Panny-AI
   ```
2. Navigate to the project directory:
   ```bash
   cd Panny-AI-Companion
   ```

#### Client Setup:

1. Navigate to the `forntEnd` directory:
   ```bash
   cd frontEnd
   ```
2. Install the dependencies:
   ```bash
   npm i
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:5173` in your browser to view the site.

#### Server Setup:

1. Navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install the Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the server:
   ```bash
   python main.py
   ```
4. The server will be running on `http://localhost:5000`.

## 📄 Requirements

The following Python packages are required for the backend:

```bash
Flask>=3.0.0,<4.0.0
python-dotenv>=1.0.1,<2.0.0
supabase>=2.6.0,<3.0.0
requests>=2.32.3,<3.0.0
openai>=1.13.3,<2.0.0
gradio_client>=2.0.2,<3.0.0
gunicorn>=22.0.0,<23.0.0

```

## Credits

This project was developed collaboratively by the following team:

- **Frontend and Backend Development**: [kndehh](https://github.com/kndehh)
- **AI Model Development**: [PokerTick](https://github.com/pokertick)
- **Website Tester and Data Collector**: [Joshhh1144](https://github.com/Joshhh1144)

Also thank you to the university team for their support and to the community for providing open-source project, tools, and the inspiration.
