import boto3
import os
import json
from botocore.config import Config

dynamodb = boto3.resource('dynamodb')
s3 = boto3.client('s3', config=Config(signature_version='s3v4'))

def handler(event, context):
    """
    AppSync Lambda handler for listAllMusic query
    Returns list of all music from all users with presigned streaming URLs
    Read-only access for discovery/explore functionality
    """
    TABLE_NAME = os.environ['TABLE_NAME']
    BUCKET_NAME = os.environ['BUCKET_NAME']
    table = dynamodb.Table(TABLE_NAME)

    identity = event.get('identity', {})
    claims = identity.get('claims', {})
    user_id = claims.get('sub') or identity.get('sub')
    
    print(f"ListAllMusic called by user: {user_id or 'anonymous'}")

    # Get all music from all users
    response = table.scan()
    items = response.get('Items', [])

    for item in items:
        if 's3_key' in item:
            item['stream_url'] = s3.generate_presigned_url(
                'get_object',
                Params={'Bucket': BUCKET_NAME, 'Key': item['s3_key']},
                ExpiresIn=3600
            )

    return items
