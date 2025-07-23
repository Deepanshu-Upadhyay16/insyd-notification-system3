echo "🚀 Setting up Railway deployment for Insyd Notification System"

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

echo "🔐 Please login to Railway..."
railway login

echo "📦 Creating new Railway project..."
railway new

echo "🔗 Linking to Railway project..."
railway link

echo "🗄️  Adding MySQL database..."
echo "⚠️  IMPORTANT: You need to add MySQL database manually!"
echo "   1. Go to Railway dashboard: https://railway.app/dashboard"
echo "   2. Click 'Add Service' → 'Database' → 'MySQL'"
echo "   3. Wait for database to be provisioned"
echo ""
echo "Press Enter after you've added the MySQL database..."
read -p ""

echo "⚙️  Setting environment variables..."
railway variables set NODE_ENV=production
railway variables set PORT=5000

# Get the Railway app URL
echo "🌐 Getting Railway app URL..."
RAILWAY_URL=$(railway status --json | grep -o '"url":"[^"]*' | cut -d'"' -f4)

if [ -n "$RAILWAY_URL" ]; then
    echo "Setting FRONTEND_URL to: $RAILWAY_URL"
    railway variables set FRONTEND_URL=$RAILWAY_URL
else
    echo "⚠️  Could not auto-detect Railway URL. Please set FRONTEND_URL manually:"
    echo "   railway variables set FRONTEND_URL=https://your-app-name.up.railway.app"
fi

echo "🚀 Deploying application..."
railway up

echo ""
echo "✅ Deployment initiated!"
echo "📊 Check status: railway logs"
echo "🌐 Dashboard: https://railway.app/dashboard"
echo ""
echo "🔍 After deployment, verify:"
echo "   1. Check logs: railway logs"
echo "   2. Test health: curl \$RAILWAY_URL/health"
echo "   3. Test API: curl \$RAILWAY_URL/api/users"
