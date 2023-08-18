# js-docker-isolation-provider

- `/healthz` - GET - 200 - Health check endpoint
  - Response:
    - `{}`
- `/init` - GET - 200 - Initialization endpoint
  - Response:
    - `{}`
  - Response:
    - `{ resolved?: any; rejected?: any; }` - If resolved or rejected is not null, then it's result of execution
