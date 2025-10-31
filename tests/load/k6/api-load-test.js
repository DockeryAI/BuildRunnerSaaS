import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('error_rate');
const responseTime = new Trend('response_time');
const requestCount = new Counter('request_count');

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 10 },   // Ramp up to 10 users
    { duration: '5m', target: 10 },   // Stay at 10 users
    { duration: '2m', target: 50 },   // Ramp up to 50 users
    { duration: '5m', target: 50 },   // Stay at 50 users
    { duration: '2m', target: 100 },  // Ramp up to 100 users
    { duration: '5m', target: 100 },  // Stay at 100 users
    { duration: '5m', target: 0 },    // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<400', 'p(99)<900'], // 95% of requests under 400ms, 99% under 900ms
    http_req_failed: ['rate<0.01'],                 // Error rate under 1%
    error_rate: ['rate<0.01'],
    response_time: ['p(95)<400', 'p(99)<900'],
  },
};

// Base URL - can be overridden with environment variable
const BASE_URL = __ENV.BASE_URL || 'https://api.buildrunner.cloud';

// Authentication token - should be provided via environment variable
const AUTH_TOKEN = __ENV.AUTH_TOKEN || '';

// Test data
const testUsers = [
  { email: 'test1@example.com', password: 'testpass123' },
  { email: 'test2@example.com', password: 'testpass123' },
  { email: 'test3@example.com', password: 'testpass123' },
];

const testProjects = [
  { name: 'Test Project 1', description: 'Load test project 1' },
  { name: 'Test Project 2', description: 'Load test project 2' },
  { name: 'Test Project 3', description: 'Load test project 3' },
];

// Helper function to make authenticated requests
function makeAuthenticatedRequest(method, url, payload = null) {
  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AUTH_TOKEN}`,
      'User-Agent': 'k6-load-test/1.0',
    },
  };

  let response;
  const startTime = Date.now();

  if (method === 'GET') {
    response = http.get(url, params);
  } else if (method === 'POST') {
    response = http.post(url, JSON.stringify(payload), params);
  } else if (method === 'PUT') {
    response = http.put(url, JSON.stringify(payload), params);
  } else if (method === 'DELETE') {
    response = http.del(url, null, params);
  }

  const duration = Date.now() - startTime;
  
  // Record metrics
  requestCount.add(1);
  responseTime.add(duration);
  errorRate.add(response.status >= 400);

  return response;
}

// Test scenarios
export default function () {
  const scenario = Math.random();
  
  if (scenario < 0.3) {
    // 30% - Authentication and user management
    testAuthentication();
  } else if (scenario < 0.6) {
    // 30% - Project and build operations
    testProjectOperations();
  } else if (scenario < 0.8) {
    // 20% - Analytics and reporting
    testAnalytics();
  } else {
    // 20% - Mixed operations
    testMixedOperations();
  }
  
  sleep(1); // Think time between requests
}

function testAuthentication() {
  // Health check
  let response = makeAuthenticatedRequest('GET', `${BASE_URL}/health`);
  check(response, {
    'health check status is 200': (r) => r.status === 200,
    'health check response time < 100ms': (r) => r.timings.duration < 100,
  });

  // Get user profile
  response = makeAuthenticatedRequest('GET', `${BASE_URL}/api/auth/me`);
  check(response, {
    'user profile status is 200': (r) => r.status === 200,
    'user profile has email': (r) => JSON.parse(r.body).email !== undefined,
  });

  // List user roles
  response = makeAuthenticatedRequest('GET', `${BASE_URL}/api/auth/roles`);
  check(response, {
    'roles status is 200': (r) => r.status === 200,
  });
}

function testProjectOperations() {
  // List projects
  let response = makeAuthenticatedRequest('GET', `${BASE_URL}/api/projects`);
  check(response, {
    'projects list status is 200': (r) => r.status === 200,
    'projects list is array': (r) => Array.isArray(JSON.parse(r.body).projects),
  });

  const projects = JSON.parse(response.body).projects || [];
  
  if (projects.length > 0) {
    const project = projects[Math.floor(Math.random() * projects.length)];
    
    // Get project details
    response = makeAuthenticatedRequest('GET', `${BASE_URL}/api/projects/${project.id}`);
    check(response, {
      'project details status is 200': (r) => r.status === 200,
      'project has id': (r) => JSON.parse(r.body).id !== undefined,
    });

    // List builds for project
    response = makeAuthenticatedRequest('GET', `${BASE_URL}/api/projects/${project.id}/builds`);
    check(response, {
      'builds list status is 200': (r) => r.status === 200,
    });

    // Get project analytics
    response = makeAuthenticatedRequest('GET', `${BASE_URL}/api/projects/${project.id}/analytics`);
    check(response, {
      'project analytics status is 200': (r) => r.status === 200,
    });
  }
}

function testAnalytics() {
  // Dashboard analytics
  let response = makeAuthenticatedRequest('GET', `${BASE_URL}/api/analytics/dashboard`);
  check(response, {
    'dashboard analytics status is 200': (r) => r.status === 200,
  });

  // Performance metrics
  response = makeAuthenticatedRequest('GET', `${BASE_URL}/api/analytics/performance/metrics`);
  check(response, {
    'performance metrics status is 200': (r) => r.status === 200,
  });

  // Usage statistics
  response = makeAuthenticatedRequest('GET', `${BASE_URL}/api/analytics/usage`);
  check(response, {
    'usage statistics status is 200': (r) => r.status === 200,
  });

  // Cost analytics
  response = makeAuthenticatedRequest('GET', `${BASE_URL}/api/analytics/costs`);
  check(response, {
    'cost analytics status is 200': (r) => r.status === 200,
  });
}

function testMixedOperations() {
  // Search functionality
  let response = makeAuthenticatedRequest('GET', `${BASE_URL}/api/search?q=test`);
  check(response, {
    'search status is 200': (r) => r.status === 200,
  });

  // Notifications
  response = makeAuthenticatedRequest('GET', `${BASE_URL}/api/notifications`);
  check(response, {
    'notifications status is 200': (r) => r.status === 200,
  });

  // Settings
  response = makeAuthenticatedRequest('GET', `${BASE_URL}/api/settings`);
  check(response, {
    'settings status is 200': (r) => r.status === 200,
  });

  // Billing information
  response = makeAuthenticatedRequest('GET', `${BASE_URL}/api/billing/invoices`);
  check(response, {
    'billing status is 200': (r) => r.status === 200,
  });
}

// Setup function - runs once before the test
export function setup() {
  console.log('Starting load test...');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Auth Token: ${AUTH_TOKEN ? 'Provided' : 'Missing'}`);
  
  // Verify API is accessible
  const response = http.get(`${BASE_URL}/health`);
  if (response.status !== 200) {
    throw new Error(`API health check failed: ${response.status}`);
  }
  
  return { baseUrl: BASE_URL };
}

// Teardown function - runs once after the test
export function teardown(data) {
  console.log('Load test completed');
  console.log(`Total requests: ${requestCount.count}`);
  console.log(`Average response time: ${responseTime.avg}ms`);
  console.log(`Error rate: ${(errorRate.rate * 100).toFixed(2)}%`);
}

// Handle summary - custom summary output
export function handleSummary(data) {
  const summary = {
    test_start: data.state.testRunDurationMs,
    total_requests: data.metrics.http_reqs.count,
    failed_requests: data.metrics.http_req_failed.count,
    error_rate: data.metrics.http_req_failed.rate,
    avg_response_time: data.metrics.http_req_duration.avg,
    p95_response_time: data.metrics.http_req_duration['p(95)'],
    p99_response_time: data.metrics.http_req_duration['p(99)'],
    max_response_time: data.metrics.http_req_duration.max,
    requests_per_second: data.metrics.http_reqs.rate,
    data_received: data.metrics.data_received.count,
    data_sent: data.metrics.data_sent.count,
    vus_max: data.metrics.vus_max.max,
    iterations: data.metrics.iterations.count,
  };

  // Output to console
  console.log('\n=== LOAD TEST SUMMARY ===');
  console.log(`Total Requests: ${summary.total_requests}`);
  console.log(`Failed Requests: ${summary.failed_requests}`);
  console.log(`Error Rate: ${(summary.error_rate * 100).toFixed(2)}%`);
  console.log(`Average Response Time: ${summary.avg_response_time.toFixed(2)}ms`);
  console.log(`P95 Response Time: ${summary.p95_response_time.toFixed(2)}ms`);
  console.log(`P99 Response Time: ${summary.p99_response_time.toFixed(2)}ms`);
  console.log(`Requests/Second: ${summary.requests_per_second.toFixed(2)}`);
  console.log(`Max VUs: ${summary.vus_max}`);

  // Return summary for file output
  return {
    'summary.json': JSON.stringify(summary, null, 2),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}

// Text summary helper
function textSummary(data, options = {}) {
  const indent = options.indent || '';
  const enableColors = options.enableColors || false;
  
  let summary = `${indent}✓ Load Test Results\n\n`;
  
  // Add key metrics
  summary += `${indent}  Total Requests: ${data.metrics.http_reqs.count}\n`;
  summary += `${indent}  Failed Requests: ${data.metrics.http_req_failed.count}\n`;
  summary += `${indent}  Error Rate: ${(data.metrics.http_req_failed.rate * 100).toFixed(2)}%\n`;
  summary += `${indent}  Avg Response Time: ${data.metrics.http_req_duration.avg.toFixed(2)}ms\n`;
  summary += `${indent}  P95 Response Time: ${data.metrics.http_req_duration['p(95)'].toFixed(2)}ms\n`;
  summary += `${indent}  P99 Response Time: ${data.metrics.http_req_duration['p(99)'].toFixed(2)}ms\n`;
  summary += `${indent}  Requests/Second: ${data.metrics.http_reqs.rate.toFixed(2)}\n`;
  
  return summary;
}
