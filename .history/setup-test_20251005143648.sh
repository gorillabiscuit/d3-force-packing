#!/bin/bash

echo "🚀 Setting up D3 Force Packing Local Test Environment..."
echo ""

# Navigate to test directory
cd test-react-app

echo "📦 Installing dependencies..."
npm install

echo ""
echo "✅ Setup complete!"
echo ""
echo "🎯 To start testing:"
echo "   cd test-react-app"
echo "   npm run dev"
echo ""
echo "📱 Test different breakpoints:"
echo "   - Mobile: Resize browser to < 640px"
echo "   - Tablet: Resize browser to 768-1023px" 
echo "   - Desktop: Resize browser to > 1024px"
echo ""
echo "🌐 App will open at: http://localhost:3000"
echo ""
echo "🔧 Configuration: Edit src/components/D3ForcePacking.tsx"
echo "📖 Documentation: See test-react-app/README.md"
