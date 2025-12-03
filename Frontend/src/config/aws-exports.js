// Frontend/src/config/aws-exports.js
// Configuration is now loaded from .env file

const awsExports = {
    "aws_project_region": import.meta.env.VITE_AWS_REGION,
    "aws_appsync_graphqlEndpoint": import.meta.env.VITE_GRAPHQL_ENDPOINT,
    "aws_appsync_region": import.meta.env.VITE_AWS_REGION,
    "aws_appsync_authenticationType": "AMAZON_COGNITO_USER_POOLS",
    
    "aws_cognito_region": import.meta.env.VITE_AWS_REGION,
    "aws_user_pools_id": import.meta.env.VITE_USER_POOL_ID,
    "aws_user_pools_web_client_id": import.meta.env.VITE_USER_POOL_CLIENT_ID,
};

export default awsExports;