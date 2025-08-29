#!/bin/bash

echo "🚀 Starting Activepieces Development with Custom Pieces"
echo "=============================================="

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Creating from template..."
    cp .env.example .env
    echo "✅ .env file created. Please configure it with your settings."
    exit 1
fi

# Check environment configuration
echo "📋 Checking configuration..."
if grep -q "AP_PIECES_SOURCE=FILE" .env; then
    echo "✅ PIECES_SOURCE set to FILE"
else
    echo "❌ PIECES_SOURCE not set to FILE in .env"
    echo "   Please add: AP_PIECES_SOURCE=FILE"
    exit 1
fi

if grep -q "AP_DEV_PIECES=" .env; then
    echo "✅ DEV_PIECES configured"
else
    echo "❌ DEV_PIECES not configured in .env"
    echo "   Please add: AP_DEV_PIECES=@activepieces/piece-my-custom-piece"
    exit 1
fi

# Build custom pieces
echo "🔨 Building custom pieces..."
npm run build-piece || {
    echo "❌ Failed to build custom pieces"
    echo "   Trying individual build..."
    npx nx build pieces-my-custom-piece || {
        echo "❌ Failed to build custom piece"
        exit 1
    }
}

# Build server components
echo "🏗️  Building server components..."
npx nx build server-api || {
    echo "❌ Failed to build server API"
    exit 1
}

npx nx build engine || {
    echo "❌ Failed to build engine"
    exit 1
}

echo "✅ All builds completed successfully!"

# Start development mode
echo "🎯 Starting development mode..."
echo "   Server will be available at: http://localhost:3000"
echo "   Frontend will be available at: http://localhost:4200"
echo ""
echo "🔍 Custom pieces should appear in the pieces list"
echo "   Look for: 'My Custom Piece'"
echo ""

# Export environment variables and start
export $(grep -v '^#' .env | xargs)
npm run dev

echo "👋 Development server stopped"