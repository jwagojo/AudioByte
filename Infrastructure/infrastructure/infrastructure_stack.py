from aws_cdk import (
    Stack,
    RemovalPolicy,
    CfnOutput,
    aws_s3 as s3,
    aws_dynamodb as dynamodb,
    aws_lambda as _lambda,
    aws_appsync as appsync,
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

        music_bucket = s3.Bucket(self, "AudioByteMusic",
            bucket_name="audiobyte-music-6203",
            removal_policy=RemovalPolicy.DESTROY,
            auto_delete_objects=True,
            cors=[s3.CorsRule(
                allowed_methods=[s3.HttpMethods.PUT, s3.HttpMethods.GET, s3.HttpMethods.HEAD],
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

        music_bucket.grant_put(upload_fn)
        music_bucket.grant_read(list_fn)
        music_table.grant_read_write_data(upload_fn)
        music_table.grant_read_data(list_fn)

        # GraphQL API with AppSync
        graphql_api = appsync.GraphqlApi(self, "AudioByteGraphQL",
            name="audiobyte-graphql-6203",
            schema=appsync.SchemaFile.from_asset(os.path.join(os.path.dirname(__file__), "..", "schema.graphql")),
            authorization_config=appsync.AuthorizationConfig(
                default_authorization=appsync.AuthorizationMode(
                    authorization_type=appsync.AuthorizationType.API_KEY
                )
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

        list_data_source.create_resolver("ListMusicResolver",
            type_name="Query",
            field_name="listMusic"
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

        music_data_source.create_resolver("DeleteMusicResolver",
            type_name="Mutation",
            field_name="deleteMusic",
            request_mapping_template=appsync.MappingTemplate.dynamo_db_delete_item("music_id", "music_id"),
            response_mapping_template=appsync.MappingTemplate.dynamo_db_result_item()
        )

        CfnOutput(self, "GraphQLApiUrl",
            value=graphql_api.graphql_url,
            description="GraphQL API URL"
        )
        
        CfnOutput(self, "GraphQLApiKey",
            value=graphql_api.api_key or "No API Key",
            description="GraphQL API Key"
        )
