# Check if .env exists
$envFile = ".env"
if (-not (Test-Path $envFile)) {
    Write-Host "Creating .env file from .env.example..."
    Copy-Item ".env.example" -Destination $envFile
    Write-Host "✅ Created .env file"
    Write-Host ""
    Write-Host "❗ Please configure your .env file with the following:"
    Write-Host "1. Get a free MongoDB Atlas database: https://cloud.mongodb.com"
    Write-Host "2. Create a new cluster and database user"
    Write-Host "3. Update MONGODB_URI in .env with your connection string"
    Write-Host "   Example: mongodb+srv://<username>:<password>@<cluster>.mongodb.net/timebank"
    exit 0
}

# Install dependencies
Write-Host "`nInstalling dependencies..."
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Error "❌ Failed to install dependencies"
    exit 1
}
Write-Host "✅ Dependencies installed"

# Check MongoDB connection
Write-Host "`nVerifying MongoDB connection..."
$nodeScript = @'
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Successfully connected to MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    console.log('\nPlease check your MONGODB_URI in .env file');
    console.log('Get a free MongoDB Atlas database: https://cloud.mongodb.com');
    process.exit(1);
  }
}

testConnection();
'@

$nodeScript | Out-File -FilePath ".mongo-test.js" -Encoding utf8
node .mongo-test.js
Remove-Item ".mongo-test.js"

if ($LASTEXITCODE -ne 0) {
    exit 1
}

Write-Host "`n🎉 Development environment is ready!"
Write-Host "Run 'npm run dev' to start the development server"
