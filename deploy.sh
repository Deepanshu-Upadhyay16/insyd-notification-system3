echo "🚀 Deploying Insyd Notification System to Railway"

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Login to Railway (if not already logged in)
echo "🔐 Logging into Railway..."
railway login

# Create new project
echo "📦 Creating new Railway project..."
railway new

# Link to the project
railway link

# Add MySQL database
echo "🗄️  Adding MySQL database..."
echo "Please add MySQL database manually in Railway dashboard"
echo "Go to: https://railway.app/dashboard -> Add Service -> Database -> MySQL"

# Set environment variables
echo "⚙️  Setting environment variables..."
railway variables set NODE_ENV=production
railway variables set PORT=5000

# Deploy the application
echo "🚀 Deploying application..."
railway up

echo "✅ Deployment initiated! Check Railway dashboard for status."
echo "📊 Dashboard: https://railway.app/dashboard"
