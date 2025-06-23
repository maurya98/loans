const axios = require('axios');

// Configuration
const GATEWAY_URL = 'http://localhost:3000';
const USER_SERVICE_URL = 'http://localhost:3001';
const PRODUCT_SERVICE_URL = 'http://localhost:3002';

// Example usage of the API Gateway
async function basicUsageExample() {
  console.log('🚀 API Gateway Basic Usage Example\n');

  try {
    // 1. Health Check
    console.log('1. Checking Gateway Health...');
    const healthResponse = await axios.get(`${GATEWAY_URL}/health`);
    console.log('✅ Gateway Health:', healthResponse.data);
    console.log('');

    // 2. User Registration
    console.log('2. Registering a new user...');
    const registerResponse = await axios.post(`${GATEWAY_URL}/auth/register`, {
      username: 'john_doe',
      email: 'john@example.com',
      password: 'password123'
    });
    
    const { accessToken, refreshToken, user } = registerResponse.data;
    console.log('✅ User registered:', user.username);
    console.log('');

    // 3. User Login
    console.log('3. Logging in...');
    const loginResponse = await axios.post(`${GATEWAY_URL}/auth/login`, {
      email: 'john@example.com',
      password: 'password123'
    });
    
    const { accessToken: newAccessToken } = loginResponse.data;
    console.log('✅ Login successful');
    console.log('');

    // 4. Get User Profile
    console.log('4. Getting user profile...');
    const profileResponse = await axios.get(`${GATEWAY_URL}/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${newAccessToken}`
      }
    });
    console.log('✅ User profile:', profileResponse.data.user);
    console.log('');

    // 5. Create API Key
    console.log('5. Creating API key...');
    const apiKeyResponse = await axios.post(`${GATEWAY_URL}/auth/api-keys`, {
      name: 'Test API Key',
      permissions: ['read', 'write']
    }, {
      headers: {
        'Authorization': `Bearer ${newAccessToken}`
      }
    });
    
    const apiKey = apiKeyResponse.data.apiKey.key;
    console.log('✅ API key created:', apiKeyResponse.data.apiKey.name);
    console.log('');

    // 6. List API Keys
    console.log('6. Listing API keys...');
    const apiKeysResponse = await axios.get(`${GATEWAY_URL}/auth/api-keys`, {
      headers: {
        'Authorization': `Bearer ${newAccessToken}`
      }
    });
    console.log('✅ API keys:', apiKeysResponse.data.apiKeys.length, 'keys found');
    console.log('');

    // 7. Create a Route (Admin only)
    console.log('7. Creating a route to user service...');
    const routeResponse = await axios.post(`${GATEWAY_URL}/admin/routes`, {
      name: 'User API',
      path: '/api/users',
      method: 'GET',
      upstream: 'user-service',
      authentication: true,
      rateLimit: {
        maxRequests: 100,
        windowMs: 900000
      }
    }, {
      headers: {
        'Authorization': `Bearer ${newAccessToken}`
      }
    });
    console.log('✅ Route created:', routeResponse.data.route.name);
    console.log('');

    // 8. Create a Service
    console.log('8. Creating user service definition...');
    const serviceResponse = await axios.post(`${GATEWAY_URL}/admin/services`, {
      name: 'user-service',
      hosts: [USER_SERVICE_URL],
      healthCheck: '/health'
    }, {
      headers: {
        'Authorization': `Bearer ${newAccessToken}`
      }
    });
    console.log('✅ Service created:', serviceResponse.data.service.name);
    console.log('');

    // 9. Get Metrics
    console.log('9. Getting gateway metrics...');
    const metricsResponse = await axios.get(`${GATEWAY_URL}/admin/metrics`, {
      headers: {
        'Authorization': `Bearer ${newAccessToken}`
      }
    });
    console.log('✅ Metrics:', metricsResponse.data.metrics);
    console.log('');

    // 10. Test the Gateway Route
    console.log('10. Testing gateway route...');
    try {
      const gatewayResponse = await axios.get(`${GATEWAY_URL}/api/users`, {
        headers: {
          'Authorization': `Bearer ${newAccessToken}`
        }
      });
      console.log('✅ Gateway route working:', gatewayResponse.data);
    } catch (error) {
      console.log('⚠️  Gateway route test failed (expected if user service is not running):', error.message);
    }
    console.log('');

    // 11. Update User Profile
    console.log('11. Updating user profile...');
    const updateResponse = await axios.put(`${GATEWAY_URL}/auth/profile`, {
      username: 'john_doe_updated'
    }, {
      headers: {
        'Authorization': `Bearer ${newAccessToken}`
      }
    });
    console.log('✅ Profile updated:', updateResponse.data.user.username);
    console.log('');

    // 12. Refresh Token
    console.log('12. Refreshing access token...');
    const refreshResponse = await axios.post(`${GATEWAY_URL}/auth/refresh`, {
      refreshToken: refreshToken
    });
    console.log('✅ Token refreshed successfully');
    console.log('');

    // 13. Logout
    console.log('13. Logging out...');
    await axios.post(`${GATEWAY_URL}/auth/logout`, {
      refreshToken: refreshToken
    }, {
      headers: {
        'Authorization': `Bearer ${newAccessToken}`
      }
    });
    console.log('✅ Logout successful');
    console.log('');

    console.log('🎉 All examples completed successfully!');

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

// Example with API Key authentication
async function apiKeyExample() {
  console.log('\n🔑 API Key Authentication Example\n');

  try {
    // First, get an API key (you would normally do this through the admin interface)
    const apiKey = 'your-api-key-here'; // Replace with actual API key

    // Make a request using API key
    const response = await axios.get(`${GATEWAY_URL}/api/users`, {
      headers: {
        'x-api-key': apiKey
      }
    });

    console.log('✅ API Key authentication successful:', response.data);
  } catch (error) {
    console.log('⚠️  API Key example skipped (no valid API key)');
  }
}

// Example of rate limiting
async function rateLimitExample() {
  console.log('\n⏱️  Rate Limiting Example\n');

  try {
    const token = 'your-access-token-here'; // Replace with actual token

    // Make multiple requests quickly to trigger rate limiting
    const promises = Array.from({ length: 10 }, () =>
      axios.get(`${GATEWAY_URL}/api/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
    );

    const results = await Promise.allSettled(promises);
    
    let successCount = 0;
    let rateLimitedCount = 0;

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        successCount++;
      } else if (result.reason.response?.status === 429) {
        rateLimitedCount++;
      }
    });

    console.log(`✅ Rate limiting test completed:`);
    console.log(`   - Successful requests: ${successCount}`);
    console.log(`   - Rate limited requests: ${rateLimitedCount}`);
  } catch (error) {
    console.log('⚠️  Rate limiting example skipped (no valid token)');
  }
}

// Example of health checks
async function healthCheckExample() {
  console.log('\n🏥 Health Check Example\n');

  try {
    // Check gateway health
    const gatewayHealth = await axios.get(`${GATEWAY_URL}/health`);
    console.log('✅ Gateway Health:', gatewayHealth.data.status);

    // Check service health (if available)
    try {
      const userServiceHealth = await axios.get(`${USER_SERVICE_URL}/health`);
      console.log('✅ User Service Health:', userServiceHealth.data);
    } catch (error) {
      console.log('⚠️  User service not available');
    }

    // Get health check history
    const healthHistory = await axios.get(`${GATEWAY_URL}/admin/health-checks`);
    console.log('✅ Health check history available:', healthHistory.data.healthChecks.length, 'records');

  } catch (error) {
    console.error('❌ Health check failed:', error.message);
  }
}

// Run all examples
async function runAllExamples() {
  await basicUsageExample();
  await apiKeyExample();
  await rateLimitExample();
  await healthCheckExample();
}

// Export functions for use in other files
module.exports = {
  basicUsageExample,
  apiKeyExample,
  rateLimitExample,
  healthCheckExample,
  runAllExamples
};

// Run examples if this file is executed directly
if (require.main === module) {
  runAllExamples().catch(console.error);
} 