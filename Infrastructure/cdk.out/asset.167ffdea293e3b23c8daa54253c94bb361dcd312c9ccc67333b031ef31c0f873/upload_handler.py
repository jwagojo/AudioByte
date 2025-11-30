import boto3
import os
import json
import uuid
import datetime
from botocore.config import Config

s3 = boto3.client('s3', config=Config(signature_version='s3v4'))
dynamodb = boto3.resource('dynamodb')

def handler(event, context):

    BUCKET_NAME = os.environ['BUCKET_NAME']
    TABLE_NAME = os.environ['TABLE_NAME']
    table = dynamodb.Table(TABLE_NAME)

    try:
        body = json.loads(event.get('body', '{}'))
        filename = body.get('filename')
        if not filename:
            raise ValueError("Filename is required")
    except Exception as e:
        return {'statusCode': 400, 'body': json.dumps({'error': str(e)})}

    file_id = str(uuid.uuid4())
    key = f"{file_id}.mp3"

    presigned_url = s3.generate_presigned_url(
        'put_object',
        Params={
            'Bucket': BUCKET_NAME,
            'Key': key,
            'ContentType': 'audio/mpeg'
        },
        ExpiresIn=300
    )

    timestamp = datetime.datetime.utcnow().isoformat()
    table.put_item(Item={
        'music_id': file_id,
        'filename': filename,
        's3_key': key,
        'upload_time': timestamp
    })

    return {
        'statusCode': 200,
        'headers': {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
        },
        'body': json.dumps({
            'upload_url': presigned_url,
            'file_id': file_id
        })
    }