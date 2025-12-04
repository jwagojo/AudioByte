
#Clear all users from Cognito User Pool and their music


import boto3
import sys

USER_POOL_ID = "us-east-1_jNUjgMKOn"
DYNAMODB_TABLE = "audiobyte-metadata-6203"
S3_BUCKET = "audiobyte-music-6203"

def get_user_sub(cognito, username):

    try:
        response = cognito.admin_get_user(
            UserPoolId=USER_POOL_ID,
            Username=username
        )
        for attr in response.get('UserAttributes', []):
            if attr['Name'] == 'sub':
                return attr['Value']
    except Exception as e:
        print(f" Warning: Cant get sub for {username}: {str(e)}")
    return None

def delete_user_music(user_sub, username):
    dynamodb = boto3.resource('dynamodb')
    s3 = boto3.client('s3')
    table = dynamodb.Table(DYNAMODB_TABLE)
    
    print(f"  Scanning for music by user: {username} (ID: {user_sub})")
    
    try:
        response = table.scan(
            FilterExpression='user_id = :uid',
            ExpressionAttributeValues={':uid': user_sub}
        )
        
        items = response.get('Items', [])
        print(f"  Found {len(items)} track(s) to delete")
        
        for item in items:
            music_id = item['music_id']
            title = item.get('title', 'Unknown')
            s3_key = item.get('s3_key', f"music/{user_sub}/{music_id}.mp3")
            
            print(f"  - Deleting: {title}")
            
            try:
                s3.delete_object(Bucket=S3_BUCKET, Key=s3_key)
                print(f" Deleted from S3: {s3_key}")
            except Exception as e:
                print(f" Failed to delete from S3: {str(e)}")
            
            try:
                table.delete_item(Key={'music_id': music_id})
                print(f" Deleted from DynamoDB")
            except Exception as e:
                print(f" Failed to delete from DynamoDB: {str(e)}")
        
        return len(items)
        
    except Exception as e:
        print(f" Error deleting music: {str(e)}")
        return 0

def clear_all_users():
    cognito = boto3.client('cognito-idp')
    
    print(f"Fetching all users from User Pool: {USER_POOL_ID}")
    print()
    
    try:
        # List all users
        response = cognito.list_users(UserPoolId=USER_POOL_ID)
        users = response.get('Users', [])
        
        if not users:
            print("No users found in the user pool.")
            return
        
        print(f"Found {len(users)} user(s)")
        print()
        
        total_tracks_deleted = 0
        
        for user in users:
            username = user['Username']
            print(f"Processing user: {username}")
            
            user_sub = get_user_sub(cognito, username)
            
            if user_sub:
                tracks_deleted = delete_user_music(user_sub, username)
                total_tracks_deleted += tracks_deleted
            else:
                print(f" Skipping music deletion (no user_id found)")
            
            try:
                cognito.admin_delete_user(
                    UserPoolId=USER_POOL_ID,
                    Username=username
                )
                print(f" Successfully deleted user: {username}")
            except Exception as e:
                print(f" Failed to delete user {username}: {str(e)}")
            
            print()
        
        print("=" * 60)
        print(f"Cleanup complete!")
        print(f"  Users deleted: {len(users)}")
        print(f"  Tracks deleted: {total_tracks_deleted}")
        print("=" * 60)
        
    except Exception as e:
        print(f"Error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    confirm = input(f"Are you sure you want to delete ALL users from {USER_POOL_ID}? (yes/no): ")
    if confirm.lower() == 'yes':
        clear_all_users()
    else:
        print("Operation cancelled.")
