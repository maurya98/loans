#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 API Gateway Admin Setup');
console.log('==========================\n');

// Check if .env.local exists
const envPath = path.join(__dirname, '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('Creating .env.local file...');
  
  const envContent = `# API Gateway Configuration
NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:3000

# Optional: Customize the API Gateway URL if running on a different port
# NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:3001
`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env.local file');
} else {
  console.log('✅ .env.local file already exists');
}

// Check if API Gateway directory exists
const apiGatewayPath = path.join(__dirname, '..', 'api-gateway');
if (fs.existsSync(apiGatewayPath)) {
  console.log('✅ API Gateway directory found');
  
  // Check if package.json exists in API Gateway
  const packageJsonPath = path.join(apiGatewayPath, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    console.log('✅ API Gateway package.json found');
  } else {
    console.log('⚠️  API Gateway package.json not found');
  }
} else {
  console.log('⚠️  API Gateway directory not found at ../api-gateway');
}

console.log('\n📋 Setup Instructions:');
console.log('1. Start the API Gateway:');
console.log('   cd ../api-gateway');
console.log('   npm install');
console.log('   npm run dev');
console.log('');
console.log('2. Start the Admin Interface:');
console.log('   npm install');
console.log('   npm run dev');
console.log('');
console.log('3. Open your browser and navigate to:');
console.log('   http://localhost:3001');
console.log('');
console.log('4. Login with demo credentials:');
console.log('   Username: admin');
console.log('   Password: password');
console.log('');
console.log('�� Setup complete!'); 