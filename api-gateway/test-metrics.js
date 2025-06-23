const { MetricsDBService } = require('./dist/services/metrics-db.service');

async function testMetrics() {
  const metricsService = new MetricsDBService();
  
  try {
    // Add some test metrics
    console.log('Adding test metrics...');
    
    // Record some request metrics
    await metricsService.recordRequestMetric('GET', '/api/v1/users', 200, 150, 'user-service');
    await metricsService.recordRequestMetric('POST', '/api/v1/users', 201, 200, 'user-service');
    await metricsService.recordRequestMetric('GET', '/api/v1/products', 200, 100, 'product-service');
    await metricsService.recordRequestMetric('GET', '/api/v1/users', 500, 5000, 'user-service');
    
    // Record some error metrics
    await metricsService.recordErrorMetric('validation_error', 'user-service', '/api/v1/users', 'POST');
    await metricsService.recordErrorMetric('database_error', 'product-service', '/api/v1/products', 'GET');
    
    console.log('Test metrics added successfully!');
    
    // Test getting metrics
    const metrics = await metricsService.getMetrics();
    console.log('Total metrics in database:', metrics.length);
    
    // Test getting summary
    const summary = await metricsService.getMetricsSummary();
    console.log('Metrics summary:', summary);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testMetrics(); 