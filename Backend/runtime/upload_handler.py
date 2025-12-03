import boto3
import os
import json
import uuid
import datetime
from botocore.config import Config

s3 = boto3.client('s3', config=Config(signature_version='s3v4'))
dynamodb = boto3.resource('dynamodb')

def handler(event, context):
    """
    AppSync Lambda handler for createMusic mutation
    Generates S3 presigned URL and creates DynamoDB entry
    """
    BUCKET_NAME = os.environ['BUCKET_NAME']
    TABLE_NAME = os.environ['TABLE_NAME']
    table = dynamodb.Table(TABLE_NAME)

    identity = event.get('identity', {})
    
    claims = identity.get('claims', {})
    user_id = claims.get('sub') or identity.get('sub')
    username = claims.get('cognito:username') or identity.get('username')
    
    print(f"Event received: {json.dumps(event)}")
    print(f"Identity: {json.dumps(identity)}")
    print(f"User ID: {user_id}, Username: {username}")
    
    if not user_id:
        raise Exception("User not authenticated - no user_id found in request")

    try:
        arguments = event.get('arguments', {})
        title = arguments.get('title')
        artist = arguments.get('artist', 'Unknown Artist')
        album = arguments.get('album', '')
        duration = arguments.get('duration', 0)
        
        if not title:
            raise ValueError("Title is required")
    except Exception as e:
        raise Exception(f"Invalid input: {str(e)}")

    music_id = str(uuid.uuid4())
    key = f"music/{user_id}/{music_id}.mp3"

    presigned_url = s3.generate_presigned_url(
        'put_object',
        Params={
            'Bucket': BUCKET_NAME,
            'Key': key,
            'ContentType': 'audio/mpeg'
        },
        ExpiresIn=600
    )

    timestamp = datetime.datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%S.%fZ')
    file_url = f"https://{BUCKET_NAME}.s3.amazonaws.com/{key}"
    
    table.put_item(Item={
        'music_id': music_id,
        'title': title,
        'artist': artist,
        'album': album,
        'duration': duration,
        'file_url': file_url,
        's3_key': key,
        'uploaded_at': timestamp,
        'user_id': user_id,
        'username': username or user_id
    })

    return {
        'music_id': music_id,
        'upload_url': presigned_url,
        'message': f'Upload URL generated for "{title}". Use this URL to upload your file.'
    }