# Medical Chatbot 🏥

An AI-powered healthcare assistant built with Next.js, TypeScript, and MongoDB. Features intelligent medical chat, symptom analysis, and health tracking with interactive charts.

## ✨ Features

- 🔐 **Secure Authentication** - JWT-based user authentication with NextAuth.js
- 🤖 **AI-Powered Chat** - Intelligent responses using Google Gemini AI
- 🎙️ **Voice Input** - Speech-to-text for hands-free interaction
- 🩺 **Symptom Checker** - AI-driven symptom analysis with condition suggestions
- 📊 **Health Tracking** - Monitor metrics with interactive charts
- 📱 **Responsive Design** - Beautiful UI with Tailwind CSS

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- MongoDB (local or cloud instance)
- Google Gemini AI API key

### Installation

1. **Clone and install dependencies**
```bash
git clone <repository-url>
cd medical-chatbot
npm install
```

2. **Set up environment variables**
```bash
cp .env.example .env.local
```

3. **Configure your environment**
Edit `.env.local` and update:
- `MONGODB_URI` - Your MongoDB connection string
- `GEMINI_API_KEY` - Get from [Google AI Studio](https://aistudio.google.com/app/apikey)
- `NEXTAUTH_URL` - Set to `http://localhost:3002` (or your port)
- `NEXTAUTH_SECRET` - Generate a secure secret
- `JWT_SECRET` - Generate a secure JWT secret

4. **Run the development server**
```bash
npm run dev
```

5. **Open your browser**
Navigate to [http://localhost:3002](http://localhost:3002)

## 📁 Project Structure

```
medical-chatbot/
├── src/
│   ├── app/                 # Next.js app router
│   │   ├── api/             # API routes
│   │   ├── auth/            # Authentication pages
│   │   └── dashboard/       # Main dashboard
│   ├── components/          # React components
│   │   ├── chat/           # Chat, SymptomChecker, HealthTracker
│   │   └── providers/      # SessionProvider
│   ├── lib/                # Utilities and configurations
│   │   ├── models/         # MongoDB models
│   │   ├── auth.ts         # NextAuth config
│   │   └── gemini.ts       # AI integration
│   └── types/              # TypeScript definitions
├── .env.example            # Environment variables template
└── package.json            # Dependencies
```

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Authentication**: NextAuth.js with JWT
- **Database**: MongoDB with Mongoose
- **AI**: Google Gemini AI API
- **Charts**: Recharts
- **State Management**: React Query
- **UI Components**: Headless UI

## 🔧 API Endpoints

- `POST /api/auth/callback/credentials` - Authentication
- `GET/POST /api/chat` - Chat functionality
- `GET/POST /api/symptoms` - Symptom analysis

## 📱 Usage

1. **Sign up** for a new account or **sign in** to existing one
2. **Chat** with the AI assistant for health guidance
3. **Check symptoms** using the symptom analyzer
4. **Track health metrics** with the health tracker
5. **View history** and monitor trends

## ⚠️ Important Notes

- This is a **demo application** and not a substitute for professional medical advice
- Always consult healthcare professionals for medical concerns
- The AI responses are for informational purposes only
- Ensure proper API key configuration for full functionality

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
