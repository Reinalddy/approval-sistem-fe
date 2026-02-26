# Approval System Frontend

A modern, responsive frontend application for an Approval System, built with Next.js and Tailwind CSS.

## 🚀 Features

- **Authentication**: Secure login system for authorized access.
- **Dashboard**: Overview and analytics interface with data visualization.
- **Submissions (Pengajuan)**: Interface to effortlessly submit and track approval requests.
- **Modern UI**: Polished, responsive interactions built with Tailwind CSS v4 and shadcn/ui components.
- **State Management**: Seamless global state handling utilizing Zustand.

## 🛠️ Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **Library:** [React 19](https://react.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand)
- **Icons:** [Lucide React](https://lucide.dev/icons/)
- **HTTP Client:** [Axios](https://axios-http.com/)
- **Charts:** [Recharts](https://recharts.org/)

## 📦 Installation

To get the project running locally, follow these steps:

### Prerequisites

- Node.js (v20 or higher recommended)
- Package Manager: npm, yarn, pnpm, or bun

### Steps

1. **Clone the repository** (if not already cloned):
   ```bash
   git clone <repository-url>
   cd approval-sistem-fe
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Environment Setup**:
   Check if there are required environment variables. A `.env.local` file may be needed in the root directory (e.g., to point to the backend API). If a `.env.example` is provided, copy it:
   ```bash
   cp .env.example .env.local
   ```
   *(Ensure you configure keys such as `NEXT_PUBLIC_API_URL` based on the backend environment)*

4. **Run the development server**:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open the application**:
   Navigate to [http://localhost:3000](http://localhost:3000) in your web browser.

## 📁 Project Structure

```text
├── app/                  # Next.js App Router folders
│   ├── (auth)/login      # Authentication pages
│   └── (protected)/      # Protected routes (Dashboard, Pengajuan)
├── components/           # Reusable UI components
├── lib/                  # Utility functions
├── store/                # Zustand state management slices
├── public/               # Static assets
└── types/                # TypeScript type definitions
```

## 📜 Scripts

- `npm run dev`: Starts the local development server.
- `npm run build`: Creates an optimized production build for deployment.
- `npm run start`: Starts the application in production mode.
- `npm run lint`: Runs ESLint to statically analyze the code and find potential issues.
