# Deploying to Render.com

This guide will help you deploy the Disaster Response Management System on Render.com.

## Prerequisites

1. A Render.com account
2. Your project code pushed to a Git repository (GitHub, GitLab, or Bitbucket)
3. Any API keys needed for the application

## Deployment Steps

### 1. Create a New Web Service

1. Log in to your Render.com account
2. Click on the "New +" button in the top right corner
3. Select "Web Service"
4. Connect your Git repository containing the project code
5. Configure your web service with the following settings:

   - **Name**: `disaster-response-system` (or your preferred name)
   - **Environment**: `Node`
   - **Region**: Choose the region closest to your users
   - **Branch**: `main` (or your main branch)
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `npm start`

### 2. Configure Environment Variables

In the "Environment" section of your web service, add the following environment variables:

- `NODE_ENV`: `production`
- `DATABASE_URL`: Your PostgreSQL connection string (or set up a Render PostgreSQL database)
- `VITE_GOOGLE_MAPS_API_KEY`: Your Google Maps API Key (if using Google Maps)

If you're using other API keys (OpenAI, Anthropic, etc.), add those as well:

- `OPENAI_API_KEY`: Your OpenAI API key (if using)
- `ANTHROPIC_API_KEY`: Your Anthropic API key (if using)

### 3. Set Up a PostgreSQL Database

1. Go to the "Dashboard" in Render
2. Click on "New +" and select "PostgreSQL"
3. Configure the database:
   - **Name**: `disaster-db` (or your preferred name)
   - **Database**: `disaster_db`
   - **User**: `disaster_user`
   - **Region**: Same as your web service
   - **PostgreSQL Version**: Latest available

After creating the database, Render will automatically provide connection details. Copy the "Internal Database URL" to use in your web service.

### 4. Link Database to Web Service

1. Go back to your web service settings
2. Update the `DATABASE_URL` environment variable with the Internal Database URL from your PostgreSQL database

### 5. Deploy the Web Service

1. Click on "Create Web Service" to start the deployment
2. Render will automatically build and deploy your application
3. Once deployment is complete, you'll see a URL where your application is hosted

### 6. Initialize the Database

After successful deployment, you'll need to run database migrations to set up your database schema:

1. Go to your web service's "Shell" tab
2. Run the database migration command:
   ```bash
   npm run db:push
   ```

## Post-Deployment

1. **Monitor Logs**: Use the "Logs" tab in your web service to monitor application logs and troubleshoot any issues
2. **Scale as Needed**: Adjust the instance type in the "Settings" tab if you need more resources
3. **Set Up a Custom Domain**: In the "Settings" tab, you can configure a custom domain for your application

## Important Notes

- Render's free tier PostgreSQL databases are automatically deleted after 90 days
- For production use, consider upgrading to paid plans for both web service and database
- Render automatically handles HTTPS for all deployments
- The Node.js version is determined by the engines field in your package.json file