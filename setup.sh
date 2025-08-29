#!/bin/bash

echo "🚀 SmartStart Setup Script"
echo "=========================="

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Please install it first:"
    echo "   npm install -g pnpm"
    exit 1
fi

echo "✅ pnpm is installed"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js is installed ($(node --version))"

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
pnpm prisma:generate

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Set up your database (PostgreSQL)"
echo "2. Copy env.example to .env and configure DATABASE_URL"
echo "3. Run: pnpm prisma migrate dev --name init"
echo "4. Start development: pnpm dev"
echo ""
echo "Your SmartStart app will be available at:"
echo "  Web: http://localhost:3000"
echo "  API: http://localhost:3001"
echo ""
echo "Happy coding! 🚀"
