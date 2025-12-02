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
        # AppSync can pass arguments in different ways
        # Try direct access first, then check arguments object
        music_id = event.get('music_id') or event.get('arguments', {}).get('music_id')
        
        if not music_id:
            print(f"Event received: {json.dumps(event)}")
            raise Exception('music_id is required')
        
        table = dynamodb.Table(TABLE_NAME)
        
        # First, get the item to return it (and verify it exists)
        response = table.get_item(Key={'music_id': music_id})
        
        if 'Item' not in response:
            raise Exception(f'Music with id {music_id} not found')
        
        item = response['Item']
        
        # Delete from DynamoDB
        table.delete_item(Key={'music_id': music_id})
        
        # Delete from S3 (file is stored in music/ folder)
        s3_key = f"music/{music_id}.mp3"
        
        try:
            s3.delete_object(Bucket=BUCKET_NAME, Key=s3_key)
            print(f"Successfully deleted S3 object: {s3_key} from bucket: {BUCKET_NAME}")
        except ClientError as e:
            # Log but don't fail if S3 object doesn't exist
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
