from motor.motor_asyncio import AsyncIOMotorClient
import os

# Global MongoDB client
mongo_client = None

async def connect_db():
    global mongo_client
    try:
        mongo_client = AsyncIOMotorClient(os.getenv("MONGO_DB_URL"))
        db = mongo_client.get_database("auth-project")
        print("MongoDB Connected successfully")
        return db
    except Exception as e:
        print(f"Error connecting to MongoDB: {str(e)}")
        raise

async def close_db():
    global mongo_client
    if mongo_client:
        mongo_client.close()
        print("MongoDB connection closed")