# ACI Dashboard

This is the main local frontend intended to control the local backend for investigating security information in the SOC technology stack.

## Supported Platforms

See supported platforms for the [main backend](https://github.com/Automatic-Case-Investigator/ACI_Backend)

## Installation

### Local installation

Copy the sample.env to .env and customize it for your setup:
```bash
cp sample.env .env
```

Install the dependencies and run the server:
```bash
npm install
npm start
```

### Docker

Build and run the docker compose project:
```bash
sudo docker compose build
sudo docker compose up
```
