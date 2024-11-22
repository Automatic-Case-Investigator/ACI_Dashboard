# ACI Dashboard

This is the main local frontend intended to control the local backend for investigating security information in the SOC technology stack.

## Supported Platforms

Currently, only The Hive is integrated. More integrations for SIEM and EDR would be added for case investigation.

## Installation

### Local installation

Copy the sample.env to .env and modify some of the settings based on your conditions:
```bash
cp sample.env .env
```

Install the dependencies and run the server:
```bash
npm install
npm start
```

### Docker

Build the image and create a docker container:
```bash
docker build -t your-image-name .
docker run -p 3000:3000 your-image-name
```
