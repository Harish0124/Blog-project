# Blog app

This repository contains a React frontend, an Express API, and a Vercel
configuration that deploys both from the repository root.

## Deploy to Vercel

1. Import this repository into Vercel and keep the project root set to the
   repository root. The existing `vercel.json` builds the frontend and API and
   routes `/api/*` requests to the backend.
2. Add these environment variables in the Vercel project settings for each
   environment you use (Production, Preview, and Development):
   - `MONGODB_URI`: your MongoDB Atlas connection string, including the database
     name, for example `mongodb+srv://.../blogDB`.
   - `FIREBASE_SERVICE_ACCOUNT`: the full JSON contents of a Firebase service
     account key for the `blog-app-d3c4d` Firebase project.
3. In Firebase Authentication, add the deployed Vercel domain to the
   authorized domains.
4. Redeploy after setting or changing environment variables.

Keep the service-account key private; do not commit it or put it in the
frontend. The backend grants blog creation to the Firebase user whose UID is
configured as `ADMIN_UID` in `blog-project-starter-backend/index.js`.

## Run locally

Start MongoDB locally, then open a PowerShell window in the backend directory.
Set the required environment variables and start the API:

```powershell
$env:MONGODB_URI = "mongodb://127.0.0.1:27017/blogDB"
$env:FIREBASE_SERVICE_ACCOUNT = Get-Content .\firebase-service-account.json -Raw
npm install
npm start
```

Put your private Firebase service-account JSON file at
`blog-project-starter-backend/firebase-service-account.json`; it is ignored by
Git. In a second PowerShell window, start the frontend:

```powershell
Set-Location ..\blog-project-starter-frontend
npm install
npm start
```

The frontend development proxy forwards `/api/*` to the local API. In
production, those same relative API URLs use the Vercel deployment.
