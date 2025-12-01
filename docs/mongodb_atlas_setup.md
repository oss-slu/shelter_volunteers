# How to Create a MongoDB Atlas Connection

This guide walks you through creating a MongoDB Atlas cluster and capturing the connection string needed for local development.

## Prerequisites
- A MongoDB Atlas account (you can sign up for a free account or use Google Login)

## Step-by-Step Setup

### 1. Sign in to MongoDB Atlas
Sign in to MongoDB Atlas. You can sign up for a free account or use Google Login. Follow the prompts to create an account and sign in.

### 2. Create a New Cluster
Once you are signed in, click on **Create New Cluster**.

![cluster](1create_cluster.png)

### 3. Select Free Tier
Select the free tier and click on **Create Deployment**.

![free](2free_tier.png)

### 4. Set Up Connection Security
On the Connection Security screen, pick a username and password you will use to connect to the database. You can change these later if needed. Click **Close**.

![security](3connection_security.png)

### 5. Configure Network Access
From the left navigation menu select **Network Access**.

![network access](network_access.png)

Allow connections from either your current IP address or from anywhere (for quick local development). Click **Confirm** to save your changes.

![access_from_anywhere](access_from_anywhere.png)

### 6. Capture the Connection String
Next, capture the connection string. From the **Clusters** page click **Connect** next to your cluster name.

![connect](connect.png)

Choose the **Drivers** option and copy the connection string that is displayed. Remove the placeholder username and password from the copied string.

![drivers](drivers.png)

![name](cluster_name.png)

### 7. Use the Connection String
Save this string—you will paste it into the `MONGODB_HOST` value in your `server/.env.pre-production` file. The username and password you created in step 4 should be used for the `MONGODB_USERNAME` and `MONGODB_PASSWORD` values in the same file.

