from aws_cdk import (
    Stack,
    RemovalPolicy,
    CfnOutput,
    Duration,
    aws_s3 as s3,
    aws_dynamodb as dynamodb,
    aws_lambda as _lambda,
    aws_appsync as appsync,
    aws_cognito as cognito,
    aws_iam as iam,
    aws_cloudwatch as cloudwatch,
    aws_logs as logs,
)
from constructs import Construct
import os

class InfrastructureStack(Stack):

    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # The code that defines your stack goes here

        # example resource
        # queue = sqs.Queue(
        #     self, "InfrastructureQueue",
        #     visibility_timeout=Duration.seconds(300),
        # )

        user_pool = cognito.UserPool(self, "AudioByteUserPool",
            user_pool_name="audiobyte-users-6203",
            self_sign_up_enabled=True,
            sign_in_aliases=cognito.SignInAliases(
                email=True,
                username=True
            ),
            auto_verify=cognito.AutoVerifiedAttrs(email=True),
            standard_attributes=cognito.StandardAttributes(
                email=cognito.StandardAttribute(
                    required=True,
                    mutable=True
                ),
                fullname=cognito.StandardAttribute(
                    required=False,
                    mutable=True
                )
            ),
            password_policy=cognito.PasswordPolicy(
                min_length=8,
                require_lowercase=True,
                require_uppercase=True,
                require_digits=True,
                require_symbols=False
            ),
            account_recovery=cognito.AccountRecovery.EMAIL_ONLY,
            removal_policy=RemovalPolicy.DESTROY
        )

        user_pool_client = user_pool.add_client("AudioByteAppClient",
            user_pool_client_name="audiobyte-app-client-6203",
            auth_flows=cognito.AuthFlow(
                user_password=True,
                user_srp=True,
                custom=True
            ),
            generate_secret=False,
            o_auth=cognito.OAuthSettings(
                flows=cognito.OAuthFlows(
                    authorization_code_grant=True,
                    implicit_code_grant=True
                ),
                scopes=[
                    cognito.OAuthScope.EMAIL,
                    cognito.OAuthScope.OPENID,
                    cognito.OAuthScope.PROFILE
                ]
            )
        )

        identity_pool = cognito.CfnIdentityPool(self, "AudioByteIdentityPool",
            identity_pool_name="audiobyte_identity_pool_6203",
            allow_unauthenticated_identities=False,
            cognito_identity_providers=[cognito.CfnIdentityPool.CognitoIdentityProviderProperty(
                client_id=user_pool_client.user_pool_client_id,
                provider_name=user_pool.user_pool_provider_name
            )]
        )

        authenticated_role = iam.Role(self, "CognitoAuthenticatedRole",
            assumed_by=iam.FederatedPrincipal(
                "cognito-identity.amazonaws.com",
                {
                    "StringEquals": {
                        "cognito-identity.amazonaws.com:aud": identity_pool.ref
                    },
                    "ForAnyValue:StringLike": {
                        "cognito-identity.amazonaws.com:amr": "authenticated"
                    }
                },
                "sts:AssumeRoleWithWebIdentity"
            )
        )

        authenticated_role.add_to_policy(iam.PolicyStatement(
            effect=iam.Effect.ALLOW,
            actions=[
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject"
            ],
            resources=[f"arn:aws:s3:::audiobyte-music-6203/music/${{cognito-identity.amazonaws.com:sub}}/*"]
        ))

        cognito.CfnIdentityPoolRoleAttachment(self, "IdentityPoolRoleAttachment",
            identity_pool_id=identity_pool.ref,
            roles={
                "authenticated": authenticated_role.role_arn
            }
        )

        music_bucket = s3.Bucket(self, "AudioByteMusic",
            bucket_name="audiobyte-music-6203",
            removal_policy=RemovalPolicy.DESTROY,
            auto_delete_objects=True,
            cors=[s3.CorsRule(
                allowed_methods=[s3.HttpMethods.PUT, s3.HttpMethods.GET, s3.HttpMethods.HEAD, s3.HttpMethods.DELETE],
                allowed_origins=["*"],
                allowed_headers=["*"]
            )]
        )

        music_table = dynamodb.Table(self, "AudioByteMeta",
            table_name="audiobyte-metadata-6203",
            partition_key=dynamodb.Attribute(
                name="music_id", 
                type=dynamodb.AttributeType.STRING
            ),
            removal_policy=RemovalPolicy.DESTROY
        )

        code_path = "../Backend/runtime"

        upload_fn = _lambda.Function(self, "UploadFunction",
            function_name="audiobyte-upload-6203",
            runtime=_lambda.Runtime.PYTHON_3_9,
            handler="upload_handler.handler",
            code=_lambda.Code.from_asset(code_path),
            environment={
                "BUCKET_NAME": music_bucket.bucket_name,
                "TABLE_NAME": music_table.table_name
            }
        )

        list_fn = _lambda.Function(self, "ListFunction",
            function_name="audiobyte-list-6203",
            runtime=_lambda.Runtime.PYTHON_3_9,
            handler="list_handler.handler",
            code=_lambda.Code.from_asset(code_path),
            environment={
                "BUCKET_NAME": music_bucket.bucket_name,
                "TABLE_NAME": music_table.table_name
            }
        )

        list_all_fn = _lambda.Function(self, "ListAllFunction",
            function_name="audiobyte-list-all-6203",
            runtime=_lambda.Runtime.PYTHON_3_9,
            handler="list_all_handler.handler",
            code=_lambda.Code.from_asset(code_path),
            environment={
                "BUCKET_NAME": music_bucket.bucket_name,
                "TABLE_NAME": music_table.table_name
            }
        )

        delete_fn = _lambda.Function(self, "DeleteFunction",
            function_name="audiobyte-delete-6203",
            runtime=_lambda.Runtime.PYTHON_3_9,
            handler="delete_handler.handler",
            code=_lambda.Code.from_asset(code_path),
            environment={
                "BUCKET_NAME": music_bucket.bucket_name,
                "TABLE_NAME": music_table.table_name
            }
        )

        music_bucket.grant_put(upload_fn)
        music_bucket.grant_read(list_fn)
        music_bucket.grant_read(list_all_fn)
        music_bucket.grant_delete(delete_fn)
        music_table.grant_read_write_data(upload_fn)
        music_table.grant_read_data(list_fn)
        music_table.grant_read_data(list_all_fn)
        music_table.grant_read_write_data(delete_fn)

        # GraphQL API with AppSync
        graphql_api = appsync.GraphqlApi(self, "AudioByteGraphQL",
            name="audiobyte-graphql-6203",
            schema=appsync.SchemaFile.from_asset(os.path.join(os.path.dirname(__file__), "..", "schema.graphql")),
            authorization_config=appsync.AuthorizationConfig(
                default_authorization=appsync.AuthorizationMode(
                    authorization_type=appsync.AuthorizationType.USER_POOL,
                    user_pool_config=appsync.UserPoolConfig(
                        user_pool=user_pool
                    )
                ),
                additional_authorization_modes=[
                    appsync.AuthorizationMode(
                        authorization_type=appsync.AuthorizationType.API_KEY
                    )
                ]
            ),
            xray_enabled=True
        )

        music_data_source = graphql_api.add_dynamo_db_data_source(
            "MusicTableDataSource",
            music_table
        )

        upload_data_source = graphql_api.add_lambda_data_source(
            "UploadDataSource",
            upload_fn
        )

        list_data_source = graphql_api.add_lambda_data_source(
            "ListDataSource",
            list_fn
        )

        list_all_data_source = graphql_api.add_lambda_data_source(
            "ListAllDataSource",
            list_all_fn
        )

        delete_data_source = graphql_api.add_lambda_data_source(
            "DeleteDataSource",
            delete_fn
        )

        list_data_source.create_resolver("ListMusicResolver",
            type_name="Query",
            field_name="listMusic"
        )

        list_all_data_source.create_resolver("ListAllMusicResolver",
            type_name="Query",
            field_name="listAllMusic"
        )

        music_data_source.create_resolver("GetMusicResolver",
            type_name="Query",
            field_name="getMusic",
            request_mapping_template=appsync.MappingTemplate.dynamo_db_get_item("music_id", "music_id"),
            response_mapping_template=appsync.MappingTemplate.dynamo_db_result_item()
        )

        upload_data_source.create_resolver("CreateMusicResolver",
            type_name="Mutation",
            field_name="createMusic"
        )

        delete_data_source.create_resolver("DeleteMusicResolver",
            type_name="Mutation",
            field_name="deleteMusic"
        )


        dashboard = cloudwatch.Dashboard(self, "AudioByteDashboard",
            dashboard_name="AudioByte-Monitoring-6203"
        )

        # metrics
        dashboard.add_widgets(
            cloudwatch.GraphWidget(
                title="Lambda Invocations",
                left=[
                    upload_fn.metric_invocations(statistic="Sum", period=Duration.minutes(5)),
                    list_fn.metric_invocations(statistic="Sum", period=Duration.minutes(5)),
                    list_all_fn.metric_invocations(statistic="Sum", period=Duration.minutes(5)),
                    delete_fn.metric_invocations(statistic="Sum", period=Duration.minutes(5))
                ],
                width=12
            ),
            cloudwatch.GraphWidget(
                title="Lambda Errors",
                left=[
                    upload_fn.metric_errors(statistic="Sum", period=Duration.minutes(5)),
                    list_fn.metric_errors(statistic="Sum", period=Duration.minutes(5)),
                    list_all_fn.metric_errors(statistic="Sum", period=Duration.minutes(5)),
                    delete_fn.metric_errors(statistic="Sum", period=Duration.minutes(5))
                ],
                width=12
            )
        )

        dashboard.add_widgets(
            cloudwatch.GraphWidget(
                title="Lambda Duration",
                left=[
                    upload_fn.metric_duration(statistic="Average", period=Duration.minutes(5)),
                    list_fn.metric_duration(statistic="Average", period=Duration.minutes(5)),
                    list_all_fn.metric_duration(statistic="Average", period=Duration.minutes(5)),
                    delete_fn.metric_duration(statistic="Average", period=Duration.minutes(5))
                ],
                width=12
            ),
            cloudwatch.GraphWidget(
                title="Lambda Throttles",
                left=[
                    upload_fn.metric_throttles(statistic="Sum", period=Duration.minutes(5)),
                    list_fn.metric_throttles(statistic="Sum", period=Duration.minutes(5)),
                    list_all_fn.metric_throttles(statistic="Sum", period=Duration.minutes(5)),
                    delete_fn.metric_throttles(statistic="Sum", period=Duration.minutes(5))
                ],
                width=12
            )
        )

        # DynamoDB metrics
        dashboard.add_widgets(
            cloudwatch.GraphWidget(
                title="DynamoDB Read/Write Capacity",
                left=[
                    music_table.metric_consumed_read_capacity_units(statistic="Sum", period=Duration.minutes(5)),
                ],
                right=[
                    music_table.metric_consumed_write_capacity_units(statistic="Sum", period=Duration.minutes(5))
                ],
                width=12
            ),
            cloudwatch.GraphWidget(
                title="DynamoDB User Errors",
                left=[
                    music_table.metric_user_errors(statistic="Sum", period=Duration.minutes(5))
                ],
                width=12
            )
        )

        # AppSync metrics
        appsync_4xx = cloudwatch.Metric(
            namespace="AWS/AppSync",
            metric_name="4XXError",
            dimensions_map={"GraphQLAPIId": graphql_api.api_id},
            statistic="Sum",
            period=Duration.minutes(5)
        )

        appsync_5xx = cloudwatch.Metric(
            namespace="AWS/AppSync",
            metric_name="5XXError",
            dimensions_map={"GraphQLAPIId": graphql_api.api_id},
            statistic="Sum",
            period=Duration.minutes(5)
        )

        appsync_latency = cloudwatch.Metric(
            namespace="AWS/AppSync",
            metric_name="Latency",
            dimensions_map={"GraphQLAPIId": graphql_api.api_id},
            statistic="Average",
            period=Duration.minutes(5)
        )

        dashboard.add_widgets(
            cloudwatch.GraphWidget(
                title="AppSync API Errors",
                left=[appsync_4xx, appsync_5xx],
                width=12
            ),
            cloudwatch.GraphWidget(
                title="AppSync API Latency (ms)",
                left=[appsync_latency],
                width=12
            )
        )

        # S3 metrics
        s3_bucket_size = cloudwatch.Metric(
            namespace="AWS/S3",
            metric_name="BucketSizeBytes",
            dimensions_map={
                "BucketName": music_bucket.bucket_name,
                "StorageType": "StandardStorage"
            },
            statistic="Average",
            period=Duration.days(1)
        )

        s3_object_count = cloudwatch.Metric(
            namespace="AWS/S3",
            metric_name="NumberOfObjects",
            dimensions_map={
                "BucketName": music_bucket.bucket_name,
                "StorageType": "AllStorageTypes"
            },
            statistic="Average",
            period=Duration.days(1)
        )

        dashboard.add_widgets(
            cloudwatch.GraphWidget(
                title="S3 Bucket Storage",
                left=[s3_bucket_size],
                width=12
            ),
            cloudwatch.GraphWidget(
                title="S3 Object Count",
                left=[s3_object_count],
                width=12
            )
        )

        CfnOutput(self, "GraphQLApiUrl",
            value=graphql_api.graphql_url,
            description="GraphQL API URL"
        )
        
        CfnOutput(self, "GraphQLApiKey",
            value=graphql_api.api_key or "No API Key",
            description="GraphQL API Key"
        )

        CfnOutput(self, "UserPoolId",
            value=user_pool.user_pool_id,
            description="Cognito User Pool ID"
        )

        CfnOutput(self, "UserPoolClientId",
            value=user_pool_client.user_pool_client_id,
            description="Cognito User Pool Client ID"
        )

        CfnOutput(self, "IdentityPoolId",
            value=identity_pool.ref,
            description="Cognito Identity Pool ID"
        )

        CfnOutput(self, "UploadFunctionArn",
            value=upload_fn.function_arn,
            description="Upload Lambda Function ARN"
        )

        CfnOutput(self, "ListFunctionArn",
            value=list_fn.function_arn,
            description="List Lambda Function ARN"
        )

        CfnOutput(self, "DeleteFunctionArn",
            value=delete_fn.function_arn,
            description="Delete Lambda Function ARN"
        )

        CfnOutput(self, "CloudWatchDashboardUrl",
            value=f"https://console.aws.amazon.com/cloudwatch/home?region={self.region}#dashboards:name={dashboard.dashboard_name}",
            description="CloudWatch Dashboard URL"
        )
