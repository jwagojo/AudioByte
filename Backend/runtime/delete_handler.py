import json
import os
import boto3
from botocore.exceptions import ClientError

s3 = boto3.client('s3')
dynamodb = boto3.resource('dynamodb')

BUCKET_NAME = os.environ['BUCKET_NAME']
TABLE_NAME = os.environ['TABLE_NAME']

def handler(event, context):
    """
    Delete music metadata from DynamoDB and file from S3.
    Only allows users to delete their own tracks.
    Expected event format (from AppSync):
    {
        "music_id": "uuid-string"
    }
    or
    {
        "arguments": {
            "music_id": "uuid-string"
        }
    }
    """
    try:
        
        identity = event.get('identity', {})
        
        # Check for Cognito claims
        claims = identity.get('claims', {})
        user_id = claims.get('sub') or identity.get('sub')
        
        print(f"Event received: {json.dumps(event)}")
        print(f"Identity: {json.dumps(identity)}")
        print(f"User ID: {user_id}")
        
        if not user_id:
            raise Exception("User not authenticated - no user_id found in request")
        
        music_id = event.get('music_id') or event.get('arguments', {}).get('music_id')
        
        if not music_id:
            print(f"Event received: {json.dumps(event)}")
            raise Exception('music_id is required')
        
        table = dynamodb.Table(TABLE_NAME)
        
        response = table.get_item(Key={'music_id': music_id})
        
        if 'Item' not in response:
            raise Exception(f'Music with id {music_id} not found')
        
        item = response['Item']
        
        if item.get('user_id') != user_id:
            raise Exception('You do not have permission to delete this track')
        
        table.delete_item(Key={'music_id': music_id})
        
        s3_key = item.get('s3_key', f"music/{music_id}.mp3")
        
        try:
            s3.delete_object(Bucket=BUCKET_NAME, Key=s3_key)
            print(f"Successfully deleted S3 object: {s3_key} from bucket: {BUCKET_NAME}")
        except ClientError as e:
            print(f"Warning: Could not delete S3 object {s3_key}: {e}")
        
        return {
            'music_id': item['music_id'],
            'title': item.get('title', ''),
            'artist': item.get('artist', ''),
            'album': item.get('album', ''),
            'message': 'Music deleted successfully'
        }
        
    except Exception as e:
        print(f"Error deleting music: {str(e)}")
        raise Exception(f'Failed to delete music: {str(e)}')
