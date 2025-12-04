# AudioByte - Serverless Music Streaming Platform, Upload and stream

# Members - Mohammed Aldulaimy, John Wesley Agojo, and Calvin Yorn, Ashton Roxas, and Sowndaryan Jayaprakashanand

A full stack cloud music streaming web-app built using AWS services. Includes user authentication, file uploads, and real time streaming.

# Architecture

It consists of react frontend that connects and interacts with an AppSync GraphQL API secured by an authentication token provided from Cognito authentication. When users login and interact with the application, requests now go through AppSync to specialized Lambda functions for uploading, listing, and deleting songs. The lambda functions interact with the DynamoDB to store and retrieve metadata, while the song files are stored in the s3 Bucket with presigned URLS for secure access. All components are monitored through Cloud watch dasboards that track invocations from lambda, API errors, storage metrics and database performance.

# Services Used

**AWS Lambda** - Serverless management for Upload, List, Delete handlers.
**Amazon S3** - Storage for music files with presigned URLs
**Amazon DynamoDB** - Using NoSQL database for storing music metadata
**AWS AppSync** - Managed GraphQL API with real-time capabilities
**Amazon Cognito** -User authentication and identity management for each songs.
**AWS CloudWatch** - Monitoring, logging, and dashboards.
**AWS IAM** - identity and access management with least-privilege policies
**AWS CDK** - Infrastructure (in code) for automated deployment


## Structure

 Frontend/    # React application
   ──src/
      ──components/
      ──pages/         
      ──context/       
      ──utils/        
   ── package.json
 Backend/
   ──runtime/    # Lambda function handlers
       ──upload_handler.py
       ──list_handler.py
       ──list_all_handler.py
       ──delete_handler.py
 Infrastructure/     # AWS CDK code
    ──infrastructure_stack.py
    ──app.py
    ──schema.graphql
    ──requirements.txt

