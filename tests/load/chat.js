import http from "k6/http";
import { check, sleep } from "k6";

// 500 concurrent users for 2 minutes
export const options = {
  stages: [
    { duration: "30s", target: 500 }, // Ramp up to 500 users
    { duration: "2m", target: 500 }, // Stay at 500 users
    { duration: "30s", target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ["p(95)<4000"], // 95% of requests must complete below 4.0s
    http_req_failed: ["rate<0.01"], // Error rate must be less than 1%
  },
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:3001";
const ORG_ID = "ef59f29f-c88a-46a5-b892-1ebf2db69044";

export default function () {
  // Simulate the chat request payload
  const payload = JSON.stringify({
    org_id: ORG_ID,
    message: "Hello, what services do you offer?",
    channel: "widget",
  });

  const params = {
    headers: {
      "Content-Type": "application/json",
      // In production, you would need auth tokens here if the endpoint is protected
    },
  };

  const res = http.post(`${BASE_URL}/v1/chat`, payload, params);

  check(res, {
    "status is 200": (r) => r.status === 200,
    "response has message": (r) =>
      r.json().hasOwnProperty("message") || r.json().hasOwnProperty("reply"),
  });

  // Wait 1-5 seconds before next iteration
  sleep(Math.random() * 4 + 1);
}
