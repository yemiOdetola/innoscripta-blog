# Innoscripta News Aggregator

News aggregation platform  The Guardian, The New York Times, and NewsAPI. Built with vite, TypeScript, and Tailwind CSS.

## Features

- 🔍 Search articles across multiple news sources
- 📱 Responsive design for all devices
- 🗂️ Category-based filtering
- 📅 Date range filtering
- 📰 Source selection (Guardian, NYT, NewsAPI)
- 💾 User preferences persistence (localstorage)

# UI inspiration



## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher)
- pnpm (v8 or higher)
- Docker (optional, for containerized development)

## API Keys

You'll need API keys from the following services:
- [The Guardian API](https://open-platform.theguardian.com/access/)
- [The New York Times API](https://developer.nytimes.com/get-started)
- [News API](https://newsapi.org/register)

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yemiOdetola/innoscripta-blog.git
cd innoscripta-blog
```

2. Install dependencies:
```bash
pnpm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Add your API keys to the `.env` file:
```env
VITE_GUARDIAN_API_KEY=your_guardian_api_key
VITE_NYT_API_KEY=your_nyt_api_key
VITE_NEWS_API_KEY=your_news_api_key
```

## Development

Start the development server:
```bash
pnpm dev
```

The application will be available at `http://localhost:5173`

## Docker Development

1. Build and start the container:
```bash
docker compose up --build
```

2. Access the application at `http://localhost:5173`

## Project Structure

```
src/
├── components/     # Reusable UI components
├── services/      # API and data services
│   ├── api/       # News API integrations
│   └── types/     # TypeScript interfaces
├── hooks/         # Custom React hooks
├── lib/           # Utility functions
└── styles/        # Global styles and Tailwind config
```

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm lint` - Run ESLint
- `pnpm format` - Format code with Prettier


## Acknowledgments

- [The Guardian API](https://open-platform.theguardian.com/)
- [The New York Times API](https://developer.nytimes.com/)
- [News API](https://newsapi.org/)
