# Lebanese Market Frontend

Frontend application for the Lebanese Market Online e-commerce platform built with React, TypeScript, and Vite.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Backend API running (see [Backend Repository](https://github.com/yourusername/lebanese-market-backend))

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/lebanese-market-frontend.git
   cd lebanese-market-frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the root directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:8080`

## 📁 Project Structure

```
lebanese-market-frontend/
├── src/
│   ├── components/      # React components
│   │   └── ui/         # shadcn/ui components
│   ├── context/        # React contexts (Auth, Cart)
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utilities and API client
│   ├── pages/          # Page components
│   ├── types/          # TypeScript types
│   ├── App.tsx         # Main app component
│   └── main.tsx        # Entry point
├── public/             # Static assets
├── index.html          # HTML template
└── package.json
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build for development
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🌐 API Configuration

The frontend communicates with the backend API. Configure the API URL in your `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

For production, update this to your backend API URL.

## ✨ Features

- ✅ User authentication (Sign up, Sign in, Password reset)
- ✅ Product browsing and search
- ✅ Category and subcategory filtering
- ✅ Shopping cart
- ✅ Order management with tracking
- ✅ Product reviews and ratings
- ✅ Wishlist functionality
- ✅ User profile management
- ✅ Admin dashboard
- ✅ Product image uploads
- ✅ Responsive design

## 🎨 Tech Stack

- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Routing**: React Router DOM
- **State Management**: React Context API
- **HTTP Client**: Fetch API
- **Form Handling**: React Hook Form + Zod
- **Data Fetching**: TanStack React Query

## 📦 Key Dependencies

- `react` & `react-dom` - React library
- `react-router-dom` - Routing
- `tailwindcss` - CSS framework
- `@radix-ui/*` - UI component primitives
- `lucide-react` - Icons
- `zod` - Schema validation
- `react-hook-form` - Form management
- `@tanstack/react-query` - Data fetching and caching

## 🔗 Backend Integration

This frontend requires the [Backend API](https://github.com/yourusername/lebanese-market-backend) to be running. 

### API Endpoints Used

The frontend communicates with the following backend endpoints:
- `/api/auth/*` - Authentication
- `/api/products/*` - Products
- `/api/categories/*` - Categories
- `/api/orders/*` - Orders
- `/api/cart/*` - Shopping cart
- `/api/reviews/*` - Reviews
- `/api/users/*` - User management
- `/api/wishlist/*` - Wishlist
- `/api/upload` - Image uploads

## 🎯 Development

### Adding New Components

Components are located in `src/components/`. UI components from shadcn/ui are in `src/components/ui/`.

### Adding New Pages

Pages are located in `src/pages/` and should be added to the router in `src/App.tsx`.

### API Calls

API calls are centralized in `src/lib/api.ts`. Add new API methods there.

### Styling

The project uses Tailwind CSS for styling. Component styles are defined using Tailwind utility classes.

## 🏗️ Building for Production

```bash
npm run build
```

The production build will be in the `dist/` directory.

## 🌍 Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `VITE_API_URL` | Backend API base URL | No | http://localhost:5000/api |

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop (1920px+)
- Tablet (768px - 1919px)
- Mobile (320px - 767px)

## 🔐 Authentication

The app uses JWT tokens stored in localStorage. Tokens are automatically included in API requests via the Authorization header.

## 🎨 UI Components

This project uses [shadcn/ui](https://ui.shadcn.com/) components built on Radix UI primitives. Components are located in `src/components/ui/`.

## 📄 License

ISC
