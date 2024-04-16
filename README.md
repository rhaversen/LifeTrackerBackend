# Free to use event tracker

[![Codacy Badge](https://app.codacy.com/project/badge/Grade/3e839962a2a54735a388ba6075ee9ccc)](https://app.codacy.com/gh/rhaversen/LifeTrackerBackend/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade) [![Production Docker Image CI/CD](https://github.com/rhaversen/LifeTrackerBackend/actions/workflows/build-test-push-docker.yml/badge.svg)](https://github.com/rhaversen/LifeTrackerBackend/actions/workflows/build-test-push-docker.yml) [![Fuzz Tests CI](https://github.com/rhaversen/LifeTrackerBackend/actions/workflows/build-test-fuzz.yml/badge.svg)](https://github.com/rhaversen/LifeTrackerBackend/actions/workflows/build-test-fuzz.yml) [![Dev Testing CI/CD](https://github.com/rhaversen/LifeTrackerBackend/actions/workflows/dev.yaml/badge.svg?branch=dev)](https://github.com/rhaversen/LifeTrackerBackend/actions/workflows/dev.yaml) [![Better Stack Badge](https://uptime.betterstack.com/status-badges/v2/monitor/11tf8.svg)](https://uptime.betterstack.com/?utm_source=status_badge)

This app is currently in a very early alpha stage. While it is not yet possible to retrieve or view your tracks, this functionality will be introduced soon. Start tracking today to take full advantage once this feature is available.

Track events with **Life Stats** using a straightforward webhook. Below is the essential workflow.

>You can check the health of the service **[here](https://life-stats.net/api/service/readyz)** (View uptime and database connection). The response is in simple JSON format, which can be more easily read with this [chrome extension](https://chromewebstore.google.com/detail/json-formatter/bcjindcccaagfpapjjmafapmmgkkhgoa).

## User creation

Create a user by sending a POST request to **<https://life-stats.net/api/v1/users>**. Provide a username in the request body to receive your personal access token. This token is crucial for your tracking activities, cannot be retrieved again and will allow anyone to track to your user, so keep it secure.

**CMD**

```bash
curl -X POST -H "Content-Type: application/json" -d "{\"userName\": \"Your Username Here\"}" https://www.life-stats.net/api/v1/users
```

**PowerShell**

```bash
$headers = @{ "Content-Type" = "application/json" }
$body = '{"userName": "Your Username Here"}'

Invoke-WebRequest -Uri "https://www.life-stats.net/api/v1/users" -Method Post -Headers $headers -Body $body
```

**Python**

```py
import requests

url = "https://www.life-stats.net/api/v1/users"
data = {"userName": "Your Username Here"}

response = requests.post(url, json=data)

print(response.text)
```

## Tracking

You can create tracks with a POST request to **<https://www.life-stats.net/api/v1/tracks>**. Provide a track name and your access token in the request body. There are two types of tracks: instantaneous (for current events) and relative (for past or future events), with the offset specified in milliseconds.

### Instantaneous Track

**CMD**

```bash
curl -X POST -H "Content-Type: application/json" -d "{\"trackName\": \"Your Track Name Here\", \"accessToken\": \"Your Access Token Here\"}" https://www.life-stats.net/api/v1/tracks
```

**PowerShell**

```bash
$headers = @{ "Content-Type" = "application/json" }
$body = '{"trackName": "Your Track Name Here", "accessToken": "Your Access Token Here"}'

Invoke-WebRequest -Uri "https://www.life-stats.net/api/v1/tracks" -Method Post -Headers $headers -Body $body
```

**Python**

```py
import requests

url = "https://www.life-stats.net/api/v1/tracks"
data = {"trackName": "Your Track Name Here", "accessToken": "Your Access Token Here"}

response = requests.post(url, json=data)

print(response.text)
```

### Relative Track

**CMD**

```bash
curl -X POST -H "Content-Type: application/json" -d "{\"trackName\": \"Your Track Name Here\", \"accessToken\": \"Your Access Token Here\", \"timeOffset\": \"Your Time Offset Here\"}" https://www.life-stats.net/api/v1/tracks
```

**PowerShell**

```bash
$headers = @{ "Content-Type" = "application/json" }
$body = '{"trackName": "Your Track Name Here", "accessToken": "Your Access Token Here", "timeOffset": "Your Time Offset Here"}'

Invoke-WebRequest -Uri "https://www.life-stats.net/api/v1/tracks" -Method Post -Headers $headers -Body $body
```

**Python**

```py
import requests

url = "https://www.life-stats.net/api/v1/tracks"
data = {"trackName": "Your Track Name Here", "accessToken": "Your Access Token Here", "timeOffset": "Your Time Offset Here"}

response = requests.post(url, json=data)

print(response.text)
```

## User Agreement

By accessing or using our website and services, you agree to the terms of this User Agreement. This includes our Privacy Policy, data deletion guidelines, Terms of Service, User Rights, and policy changes. We encourage you to review this document to understand our data practices and your rights.

### User- and Data Deletion

You can delete your user all all associated data with a DELETE request to **<https://www.life-stats.net/api/v1/users>**. Provide your username, access token and confirmDeletion=true in the request body.

**CMD**

```bash
curl -X DELETE -H "Content-Type: application/json" -d "{\"userName\": \"Your Username Here\", \"accessToken\": \"Your Access Token Here\", \"confirmDeletion\": true}" https://www.life-stats.net/api/v1/users
```

**PowerShell**

```bash
$headers = @{ "Content-Type" = "application/json" }
$body = '{"userName": "Your Username Here", "accessToken": "Your Access Token Here", "confirmDeletion": true}'

Invoke-WebRequest -Uri "https://www.life-stats.net/api/v1/users" -Method Delete -Headers $headers -Body $body
```

**Python**

```py
import requests

url = "https://www.life-stats.net/api/v1/users"
data = {"trackName": "Your Track Name Here", "accessToken": "Your Access Token Here", "confirmDeletion": true}

response = requests.delete(url, json=data)

print(response.text)
```

### Privacy Policy

**Data Collection**
We collect only the data you provide:

- **Username**: Your chosen pseudonym within the app.
- **Track Name**: The label you assign to each event.
- **Time of Track**: The creation time of each event, adjustable by specifying an offset.

**Data Use**

Your data is solely logged for personal reference. It is not subjected to advertising, commercial use, or analysis. Future app versions will offer enhanced data views for the user.

**Data Storage and Security**

We securely store your data in a MongoDB Cloud Database, employing standard security measures to safeguard against unauthorized access.

### Terms of Service

**Acceptance of Terms**

By using this app, you consent to these terms. Discontinue use immediately if you do not agree.

**User Conduct**

You bear responsibility for the data you track and disseminate. Ensure compliance with laws and respect for others' rights.

**Intellectual Property**

Data generated is your property. However, by using our service, you grant us a license to process this data for service provision.

### User Rights

**Data Access and Deletion**

Use your access token to request data access or deletion at any time. For guidance, consult the app documentation or contact us directly.

**Withdrawal of Consent**

You may withdraw data processing consent by deleting your data with your access token. For further instructions, refer to our documentation or reach out directly.

### Changes to Our Policies

We reserve the right to modify these legal notices at any time. Any changes will be updated in this README document. Since we do not collect email addresses, we encourage you to periodically review this document for any updates.

### Contact Information

For any questions or concerns regarding your data, privacy, or our policies, please contact me at <rhaversen@gmail.com>.
