import http from 'k6/http';
import { check, sleep } from 'k6';

/**
 * K6 API Load Test Script
 * 
 * To run this script:
 * 1. Install K6: https://k6.io/docs/get-started/installation/ 
 *    (On Linux: sudo gpg -k && sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69 && echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list && sudo apt-get update && sudo apt-get install k6)
 * 2. Run the test: 
 *    k6 run load-test.js
 */

export const options = {
  stages: [
    { duration: "1m", target: 100 },
    { duration: "2m", target: 300 },
    { duration: "3m", target: 500 },
    { duration: "3m", target: 500 },
    { duration: "1m", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<800"],
    http_req_failed: ["rate<0.03"],
  },
};
const BASE_URL = 'http://localhost:3001/api/v1'; // Based on your .env PORT=3001

export function setup() {
    // 1. Login User ONCE before the test starts to avoid the 10-req/10-min rate limit
    const loginPayload = JSON.stringify({
        email: 'test6pay@gmail.com',
        password: 'Adityakbr001@',
    });

    const headers = { 'Content-Type': 'application/json' };
    const loginRes = http.post(`${BASE_URL}/auth/login`, loginPayload, { headers });
    
    let token = null;
    try {
        const tokenResponse = loginRes.json();
        token = tokenResponse.accessToken || tokenResponse.token || tokenResponse.data?.accessToken;
    } catch (e) {
        console.error("Failed to get token during setup");
    }

    // Pass the token to the virtual users
    return { token: token };
}

export default function (data) {
    // --- 1. Test a public endpoint (example: getting courses) ---
    const coursesRes = http.get(`${BASE_URL}/courses`);
    
    check(coursesRes, {
        'GET /courses returns 200': (r) => r.status === 200,
        'GET /courses responds in < 500ms': (r) => r.timings.duration < 500,
    });
    
    // Simulate realistic user behavior by pausing between requests
    sleep(1);
    
    // --- 2. Test authenticated endpoints ---
    if (data && data.token) {
        const authHeaders = { 
            headers: { 
                'Authorization': `Bearer ${data.token}` 
            } 
        };
        
        // Test /auth/me
        const meRes = http.get(`${BASE_URL}/auth/me`, authHeaders);
        check(meRes, {
            'GET /auth/me returns 200': (r) => r.status === 200,
        });
        
        // Test /auth/session
        const sessionRes = http.get(`${BASE_URL}/auth/session`, authHeaders);
        check(sessionRes, {
            'GET /auth/session returns 200': (r) => r.status === 200,
        });

        // Test /auth/me/profile
        const profileRes = http.get(`${BASE_URL}/auth/me/profile`, authHeaders);
        check(profileRes, {
            'GET /auth/me/profile returns 200': (r) => r.status === 200,
        });

        // Test /classroom (Student Dashboard Data)
        const classroomRes = http.get(`${BASE_URL}/classroom`, authHeaders);
        check(classroomRes, {
            'GET /classroom returns 200': (r) => r.status === 200,
            'GET /classroom responds in < 1000ms': (r) => r.timings.duration < 1000,
        });

        // Test /classroom/heatmap (Student Activity)
        const heatmapRes = http.get(`${BASE_URL}/classroom/heatmap`, authHeaders);
        check(heatmapRes, {
            'GET /classroom/heatmap returns 200': (r) => r.status === 200,
        });
    } else {
        console.error("No token available for authenticated requests");
    }
}
