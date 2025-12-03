#!/bin/bash
# Script to extract Cognito configuration from CDK outputs

echo "Fetching Cognito configuration from CloudFormation stack..."
echo ""

USER_POOL_ID=$(aws cloudformation describe-stacks \
  --stack-name InfrastructureStack \
  --query "Stacks[0].Outputs[?OutputKey=='UserPoolId'].OutputValue" \
  --output text)

USER_POOL_CLIENT_ID=$(aws cloudformation describe-stacks \
  --stack-name InfrastructureStack \
  --query "Stacks[0].Outputs[?OutputKey=='UserPoolClientId'].OutputValue" \
  --output text)

GRAPHQL_URL=$(aws cloudformation describe-stacks \
  --stack-name InfrastructureStack \
  --query "Stacks[0].Outputs[?OutputKey=='GraphQLApiUrl'].OutputValue" \
  --output text)

REGION=$(aws configure get region)

echo "Copy these values to Frontend/src/config/aws-exports.js:"
echo ""
echo "aws_project_region: \"$REGION\""
echo "aws_appsync_graphqlEndpoint: \"$GRAPHQL_URL\""
echo "aws_appsync_region: \"$REGION\""
echo "aws_cognito_region: \"$REGION\""
echo "aws_user_pools_id: \"$USER_POOL_ID\""
echo "aws_user_pools_web_client_id: \"$USER_POOL_CLIENT_ID\""
