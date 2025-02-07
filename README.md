# Sahana NGO Bookkeeping System

A comprehensive bookkeeping system built with Next.js and Electron for managing NGO finances.

## Features

- **Member Management**
  - Profile tracking with contact details
  - Meeting attendance logging
  - Asset tracking across Cash Book, Loan Book, and Dividend Book

- **Cash Book Module**
  - Per-member transaction tracking
  - Automatic total calculations
  - Membership fee management

- **Loan Management**
  - Multiple loan types (Member: 9%, Special: 12%, Business: 12%)
  - Daily interest calculations
  - Flexible payment handling (premium only or premium + interest)
  - Automated interest deduction from dividends

- **Dividend Book**
  - Quarterly profit distribution
  - Attendance bonus tracking
  - Automated interest deductions
  - Total asset calculations

- **Bank & Fixed Deposit Tracking**
  - Bank account management
  - Fixed deposit tracking with maturity alerts
  - Manual entry validation

## Tech Stack

- Next.js 14 (React Framework)
- Electron (Desktop Application)
- Prisma (Database ORM)
- SQLite (Database)
- TailwindCSS (Styling)
- TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd sahana-bookkeeping
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the database:
   ```bash
   npm run prisma:migrate
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Building for Production

```bash
npm run build
```

## Project Structure

```
sahana-bookkeeping/
├── src/
│   ├── app/              # Next.js pages and components
│   ├── components/       # Reusable UI components
│   ├── lib/             # Utility functions and helpers
│   └── styles/          # Global styles and Tailwind config
├── electron/            # Electron main process code
├── prisma/             # Database schema and migrations
└── public/            # Static assets
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
