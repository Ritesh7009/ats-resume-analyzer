# ATS Resume Analyzer

A full-stack AI-powered ATS Resume Analyzer that helps job seekers optimize their resumes for Applicant Tracking Systems.

## Features

- 📄 **Resume Upload & Parsing** - Support for PDF & DOCX files
- 📊 **ATS Compatibility Score** - Get a 0-100 score based on multiple factors
- 🔍 **Detailed Feedback** - Section-by-section analysis with improvement suggestions
- 🎯 **Job Description Matching** - Compare your resume against specific job postings
- 📈 **Visual Analytics** - Charts and graphs showing your resume's strengths
- 💳 **Premium Features** - Advanced analysis via Gumroad integration
- 📧 **Email Reports** - Receive detailed analysis reports via email
- 🔐 **Secure Authentication** - JWT-based auth with email verification

## Tech Stack

### Frontend
- React 18 with TypeScript
- Material UI (MUI) v5
- React Router v6
- React Hook Form
- Framer Motion
- Recharts
- Axios

### Backend
- Node.js with Express
- TypeScript
- MongoDB with Mongoose
- JWT Authentication
- Multer for file uploads
- PDF-parse & Mammoth for document parsing
- Nodemailer for emails
- Redis for caching (optional)

## Project Structure

```
ats-resume-analyzer/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Express middleware
│   │   ├── models/          # Mongoose models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Utility functions
│   │   ├── types/           # TypeScript types
│   │   └── app.ts           # Express app
│   ├── uploads/             # Uploaded files
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom hooks
│   │   ├── services/        # API services
│   │   ├── context/         # React context
│   │   ├── utils/           # Utility functions
│   │   ├── types/           # TypeScript types
│   │   └── App.tsx          # Main app component
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your configuration
npm start
```

### Environment Variables

#### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ats-analyzer
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-secret-key
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
GUMROAD_SELLER_ID=your-gumroad-seller-id
FRONTEND_URL=http://localhost:3000
REDIS_URL=redis://localhost:6379
```

#### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_GUMROAD_PRODUCT_ID=your-product-id
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify-email` - Verify email
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `POST /api/auth/refresh-token` - Refresh access token

### Resume
- `POST /api/resume/upload` - Upload resume
- `POST /api/resume/analyze` - Analyze resume
- `POST /api/resume/match-job` - Match with job description
- `GET /api/resume/history` - Get user's resume history
- `GET /api/resume/:id` - Get specific resume analysis

### Payment
- `POST /api/payment/webhook/gumroad` - Gumroad webhook
- `GET /api/payment/status` - Check payment status

### Email
- `POST /api/email/send-report` - Send analysis report

## ATS Scoring Logic

The ATS score (0-100) is calculated based on:

1. **Keyword Relevance (25%)** - Matching industry keywords
2. **Section Structure (20%)** - Proper resume sections
3. **Formatting (15%)** - ATS-safe formatting
4. **Experience Quality (15%)** - Quantified achievements
5. **Skills Match (15%)** - Relevant skills listed
6. **File Structure (10%)** - Proper file format

## Deployment

### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
# Deploy build folder
```

### Backend (Railway/Render)
```bash
cd backend
npm run build
# Deploy with start command: npm start
```

## License

MIT License - see LICENSE file for details

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request
