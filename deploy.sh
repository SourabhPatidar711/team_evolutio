#!/bin/bash
echo "Running database migrations..."
npm run db:push
echo "Database migrations completed."
echo "Deployment completed successfully!"
