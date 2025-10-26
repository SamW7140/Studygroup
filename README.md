# Study Group - Intelligent Study Hub

![Study Group Dashboard](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-14.2-black)
![React](https://img.shields.io/badge/React-18.3-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)
![Supabase](https://img.shields.io/badge/Supabase-Ready-3ecf8e)

**An intelligent, private study hub for college classes** — inspired by Canva's dashboard design with dark gradients, neon glow accents, and smooth animations. Now with **full Supabase backend integration**!

## ✨ Features

### 🎨 Design & UI
- **Dark-first theme** with radial indigo→violet gradient backgrounds
- **Glass morphism** panels with backdrop blur effects
- **Neon glow accents** (electric cyan/violet) on interactive elements
- **Smooth animations** powered by Framer Motion
- **Responsive 3-panel layout** with collapsible sidebars
- **Accessibility-first** with keyboard navigation, ARIA labels, and focus management

### 🚀 Core Functionality
- **Dashboard** with hero search, action tiles, and recent documents grid
- **Classes** page with class cards, join codes, and member counts
- **Document management** with type-based organization (PDF, DOCX, PPTX, etc.)
- **Timeline view** in right sidebar showing upcoming assignments and deadlines
- **Persistent UI state** with Zustand (sidebar preferences, view mode, sort order)
- **Keyboard shortcuts**:
  - `Cmd/Ctrl + K` - Focus search
  - `[` - Toggle left sidebar
  - `]` - Toggle right sidebar

### 🧩 Tech Stack
- **Framework**: Next.js 14.2 (App Router) + TypeScript
- **Styling**: Tailwind CSS with custom design tokens
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **State Management**: Zustand with persistence
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Linting**: ESLint + Next.js config

## 🔥 Supabase Backend Integration

**NEW!** The project now includes complete Supabase integration:

- ✅ **Database Schema** - Complete TypeScript types matching your database
- ✅ **Authentication** - Email/password auth with session management
- ✅ **File Storage** - Document upload and management
- ✅ **Row Level Security** - User-scoped data access
- ✅ **Helper Functions** - Pre-built queries for common operations
- ✅ **Middleware** - Automatic session refresh

### Quick Setup (20 minutes)

1. **Follow the Quick Start Guide**: See `QUICK_START.md` for step-by-step instructions
2. **Complete Documentation**: See `SUPABASE_SETUP.md` for comprehensive setup
3. **Migration Guide**: See `MIGRATION_GUIDE.md` for detailed migration steps

### Supabase Files Structure

```
lib/supabase/
├── client.ts          # Client-side Supabase client
├── server.ts          # Server-side Supabase client
├── types.ts           # Database type definitions
├── queries.ts         # Helper query functions
├── storage.ts         # File upload/download utilities
├── index.ts           # Barrel exports
├── README.md          # Complete API documentation
└── TYPESCRIPT_NOTE.md # TypeScript configuration notes

middleware.ts          # Auth session middleware
.env.local            # Environment variables (add your credentials)
```

### Database Schema

Your app uses the following structure:

- **profiles** - User profiles extending Supabase Auth
- **documents** - File metadata and extracted content
- **flags** - Tags/categories (Classes, Semesters, Types, etc.)
- **document_flags** - Many-to-many relationship table

**Note**: Classes are stored as flags with `type='Class'`, not in a separate table.

## 📦 Installation

### Prerequisites
- Node.js 18+ or compatible runtime
- npm, yarn, pnpm, or bun package manager

### Quick Start

1. **Clone or download the project**
   ```bash
   cd Studygroup
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   # or
   yarn install
   # or
   bun install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   # or
   yarn dev
   # or
   bun dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🗂️ Project Structure

```
Studygroup/
├── app/
│   ├── (dashboard)/          # Route group with shared layout
│   │   ├── layout.tsx        # Dashboard layout with sidebars
│   │   ├── page.tsx          # Home/Dashboard page
│   │   └── classes/
│   │       └── page.tsx      # Classes page
│   ├── _data/                # Mock data
│   │   ├── classes.ts
│   │   ├── documents.ts
│   │   └── upcoming.ts
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles + design tokens
├── components/
│   ├── ui/                   # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── tabs.tsx
│   │   └── avatar.tsx
│   ├── layout/               # Layout components
│   │   ├── sidebar-left.tsx
│   │   ├── sidebar-right.tsx
│   │   └── top-ribbon.tsx
│   └── dashboard/            # Dashboard-specific components
│       ├── hero-search.tsx
│       ├── action-tiles.tsx
│       ├── document-card.tsx
│       └── class-card.tsx
├── store/
│   └── ui-store.ts           # Zustand store for UI state
├── lib/
│   └── utils.ts              # Utility functions
├── tailwind.config.ts        # Tailwind configuration
├── components.json           # shadcn/ui configuration
└── tsconfig.json             # TypeScript configuration
```

## 🎨 Design System

### Color Palette
```css
/* Hero Gradient (Dark mode) */
background: radial-gradient(
  ellipse at top,
  hsl(222, 84%, 8%),    /* Deep indigo */
  hsl(222, 84%, 5%),    /* Darker indigo */
  hsl(260, 75%, 8%),    /* Violet */
  hsl(260, 75%, 5%)     /* Darker violet */
);

/* Accent Colors */
--accent-indigo: #4f46e5
--accent-cyan: #22d3ee

/* Glass Panels */
background: rgba(255, 255, 255, 0.05)
backdrop-filter: blur(12px)
border: 1px solid rgba(255, 255, 255, 0.1)
```

### Typography
- **Font**: Inter (Google Fonts)
- **Headings**: Bold, gradient text effects
- **Body**: Slate-300 / Slate-400 for readability

### Spacing & Layout
- **Border Radius**: Large (2xl = 1rem) for cards, pills for controls
- **Shadows**: Soft, layered with glow effects on hover
- **Grid**: Responsive (1→2→3→4 columns based on viewport)

## 🧪 Development

### Build for Production
```bash
npm run build
npm run start
```

### Linting
```bash
npm run lint
```

### Type Checking
TypeScript is configured with strict mode. Run type checks with:
```bash
npx tsc --noEmit
```

## 🎯 Roadmap & Future Enhancements

- [ ] **Class Hub** page with tabs (Overview, Documents, AI Chat, People, Settings)
- [ ] **Document Viewer** with two-pane layout and AI chat integration
- [ ] **AI Chat interface** with source citations
- [ ] **Search modal** (Cmd+K) with fuzzy search
- [ ] **Drag & drop** file uploads
- [ ] **Real-time collaboration** indicators
- [ ] **Dark/Light theme toggle** (currently dark-only)
- [ ] **Backend integration** (replace mock data with API calls)
- [ ] **Authentication** with NextAuth.js
- [ ] **Database** integration (PostgreSQL/Supabase)

## 🤝 Contributing

This is a showcase project, but contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **Design Inspiration**: Canva Dashboard
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)

---

**Built with ❤️ using Next.js and modern web technologies.**

For questions or support, please open an issue on GitHub.
