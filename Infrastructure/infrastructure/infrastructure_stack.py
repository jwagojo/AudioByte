from aws_cdk import (
    Stack,
    RemovalPolicy,
    aws_s3 as s3,
    aws_dynamodb as dynamodb,
    aws_lambda as _lambda,
    aws_apigateway as apigateway,
)
from constructs import Construct

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

        api = apigateway.RestApi(self, "AudioByteApi",
            rest_api_name="audiobyte-api-6203",
            default_cors_preflight_options={
                "allow_origins": apigateway.Cors.ALL_ORIGINS,
                "allow_methods": apigateway.Cors.ALL_METHODS
            }
        )

        music_resource = api.root.add_resource("music")
        music_resource.add_method("POST", apigateway.LambdaIntegration(upload_fn))
        
        music_resource.add_method("GET", apigateway.LambdaIntegration(list_fn))
