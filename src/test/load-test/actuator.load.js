import http from 'k6/http';
import { check } from 'k6';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";

const port = __ENV.port;
const baseUrl = `http://localhost:${port}`;
const apiActuatorUrl = `${baseUrl}/api/actuator`;
const statusCheck = {"is status 200": response => response.status === 200};

export default function () {
    let response = http.get(`${apiActuatorUrl}/health`);
    check(response, statusCheck)

    response = http.get(`${apiActuatorUrl}/metrics`);
    check(response, statusCheck)

    response = http.get(`${apiActuatorUrl}/info`);
    check(response, statusCheck)
}

export function handleSummary(data) {
    return {
        'stdout': textSummary(data, { indent: ' ', enableColors: true }),
        "artifacts/k6-reports/actuator-load-summary.html": htmlReport(data)
    };
}

export function teardown() {
    console.log("Ending Load-Test for Maxine");
}

export let options = {
    vus: 300,
    iterations: 5000,
    duration: '10s',
    thresholds: {
        'failed requests': ['rate<0.02'],
        http_req_duration: ['p(95)<500'],
        http_reqs: ['count>90']
    },
};