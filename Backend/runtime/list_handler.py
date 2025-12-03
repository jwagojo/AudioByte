import boto3
import os
import json
from boto3.dynamodb.conditions import Key
from botocore.config import Config

dynamodb = boto3.resource('dynamodb')
s3 = boto3.client('s3', config=Config(signature_version='s3v4'))

def handler(event, context):
    """
    AppSync Lambda handler for listMusic query
    Returns list of music for the authenticated user with presigned streaming URLs
    """
    TABLE_NAME = os.environ['TABLE_NAME']
    BUCKET_NAME = os.environ['BUCKET_NAME']
    table = dynamodb.Table(TABLE_NAME)

    # Extract user identity from AppSync context
    identity = event.get('identity', {})
    
    claims = identity.get('claims', {})
    user_id = claims.get('sub') or identity.get('sub')
    
    print(f"Event received: {json.dumps(event)}")
    print(f"Identity: {json.dumps(identity)}")
    print(f"User ID: {user_id}")
    
    if not user_id:
        raise Exception("User not authenticated - no user_id found in request")

    response = table.scan(
        FilterExpression='user_id = :uid',
        ExpressionAttributeValues={':uid': user_id}
    )
    items = response.get('Items', [])

    for item in items:
        if 's3_key' in item:
            item['stream_url'] = s3.generate_presigned_url(
                'get_object',
                Params={'Bucket': BUCKET_NAME, 'Key': item['s3_key']},
                ExpiresIn=3600
            )

    return items