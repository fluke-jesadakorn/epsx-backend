# Deploying to Google Cloud Run

This guide provides step-by-step instructions for deploying this NestJS application to Google Cloud Run using Google Cloud CLI.

## Prerequisites

1. Install Google Cloud CLI:
   ```bash
   # For macOS (using Homebrew)
   brew install google-cloud-sdk
   
   # For other operating systems, visit:
   # https://cloud.google.com/sdk/docs/install
   ```

2. Initialize and authenticate:
   ```bash
   gcloud init
   gcloud auth configure-docker
   ```

## Deployment Steps

1. Set your project ID:
   ```bash
   export PROJECT_ID=your-project-id
   gcloud config set project $PROJECT_ID
   ```

2. Enable required APIs:
   ```bash
   gcloud services enable \
     containerregistry.googleapis.com \
     run.googleapis.com
   ```

3. Build and push the Docker image:
   ```bash
   # Build the image
   docker build -t gcr.io/$PROJECT_ID/investing-scrape-data .
   
   # Push to Google Container Registry
   docker push gcr.io/$PROJECT_ID/investing-scrape-data
   ```

4. Deploy to Cloud Run:
   ```bash
   gcloud run deploy investing-scrape-data \
     --image gcr.io/$PROJECT_ID/investing-scrape-data \
     --platform managed \
     --region asia-southeast1 \
     --allow-unauthenticated \
     --port 3000 \
     --memory 512Mi \
     --cpu 1 \
     --min-instances 0 \
     --max-instances 10 \
     --set-env-vars="NODE_ENV=production"
   ```

   Add any additional environment variables from your .env file:
   ```bash
   gcloud run services update investing-scrape-data \
     --update-env-vars="KEY1=VALUE1,KEY2=VALUE2"
   ```

5. Get the service URL:
   ```bash
   gcloud run services describe investing-scrape-data \
     --platform managed \
     --region asia-southeast1 \
     --format 'value(status.url)'
   ```

## Continuous Deployment (Optional)

Set up continuous deployment using Cloud Build:

1. Connect your GitHub repository to Cloud Build:
   ```bash
   gcloud builds triggers create github \
     --repo-name=investing-scrape-data \
     --branch-pattern=main \
     --build-config=cloudbuild.yaml
   ```

2. Create a `cloudbuild.yaml` file in your project root:
   ```yaml
   steps:
   # Build the container image
   - name: 'gcr.io/cloud-builders/docker'
     args: ['build', '-t', 'gcr.io/$PROJECT_ID/investing-scrape-data', '.']
   
   # Push the container image to Container Registry
   - name: 'gcr.io/cloud-builders/docker'
     args: ['push', 'gcr.io/$PROJECT_ID/investing-scrape-data']
   
   # Deploy container image to Cloud Run
   - name: 'gcr.io/cloud-builders/gcloud'
     args:
     - 'run'
     - 'deploy'
     - 'investing-scrape-data'
     - '--image'
     - 'gcr.io/$PROJECT_ID/investing-scrape-data'
     - '--region'
     - 'asia-southeast1'
     - '--platform'
     - 'managed'
     - '--allow-unauthenticated'
   
   images:
   - 'gcr.io/$PROJECT_ID/investing-scrape-data'
   ```

## Monitoring and Logs

- View logs:
  ```bash
  gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=investing-scrape-data" --limit 50
  ```

- Monitor service:
  ```bash
  gcloud run services describe investing-scrape-data
  ```

## Useful Commands

- Update service:
  ```bash
  gcloud run services update investing-scrape-data --memory 1Gi
  ```

- Delete service:
  ```bash
  gcloud run services delete investing-scrape-data
  ```

## Important Notes

1. The application is configured to use port 3000 as specified in the Dockerfile and main.ts
2. Cloud Run automatically handles HTTPS termination
3. Environment variables should be set during deployment
4. The service is configured to scale automatically based on traffic
5. Health checks are configured in the Dockerfile

## Troubleshooting

1. If deployment fails, check the build logs:
   ```bash
   gcloud builds list
   gcloud builds log [BUILD_ID]
   ```

2. If the service fails to start, check the logs:
   ```bash
   gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=investing-scrape-data"
   ```

3. If you need to test locally before deployment:
   ```bash
   docker build -t investing-scrape-data .
   docker run -p 3000:3000 investing-scrape-data
