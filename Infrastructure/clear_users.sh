
USER_POOL_ID="us-east-1_DgmyNJS0e"

echo "Fetching all users from User Pool: $USER_POOL_ID"

users=$(aws cognito-idp list-users --user-pool-id $USER_POOL_ID --query 'Users[].Username' --output text)

if [ -z "$users" ]; then
    echo "No users found in the user pool."
    exit 0
fi

echo "Found users: $users"
echo ""
echo "Deleting users..."

for username in $users; do
    echo "Deleting user: $username"
    aws cognito-idp admin-delete-user \
        --user-pool-id $USER_POOL_ID \
        --username "$username"
    
    if [ $? -eq 0 ]; then
        echo "✓ Successfully deleted: $username"
    else
        echo "✗ Failed to delete: $username"
    fi
done

echo ""
echo "User cleanup complete!"
