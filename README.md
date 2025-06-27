Mental Health Chatbot Backend

This is a FastAPI-based backend for a mental health chatbot application. It provides user authentication, conversation management, mood tracking, and crisis detection, leveraging MongoDB for data storage and LangChain with Chroma for retrieval-augmented generation (RAG) to deliver compassionate responses.

Features
User Authentication: Register and log in users with JWT-based authentication.

Chatbot Queries: Process user queries with a compassionate mental health chatbot powered by Groq’s LLM and a Chroma vector database.

Conversation Management: Create, retrieve, and manage user conversations.

Mood Tracking: Log and retrieve mood scores with timestamps.

Crisis Detection: Detect crisis-related phrases and provide emergency contact suggestions or hotline information.

Emergency Contacts: Manage user-defined emergency contacts for crisis scenarios.


Prerequisites:

MongoDB (running locally or via a cloud provider)

Groq API key (for LLM integration)

A PDF file (chatbot/data.pdf) containing mental health resources for the chatbot’s knowledge base

Installation:

1. Clone the Repository
git clone <repository-url>

2. Move to Backend folder.
cd project_fastapi/backend

3. Create a Virtual Environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

4. Install Dependencies(Install the required packages listed in requirements.txt)
pip install -r requirements.txt

5. Set Up Environment VariablesCreate a .env file in the backend directory with the following:

MONGO_DB_URL=mongodb://localhost:27017
JWT_SECRET=your_jwt_secret_here
GROQ_API_KEY=your_groq_api_key_here
ALLOWED_ORIGINS=http://localhost:8080

Replace your_jwt_secret_here with a secure secret key.
Obtain a Groq API key from Groq and add it.
Adjust ALLOWED_ORIGINS for your frontend URL(s) in production.

6. Prepare the Chatbot Data Ensure chatbot/data.pdf exists and contains relevant mental health resources. The chatbot uses this to build its knowledge base. If the vector_db/chroma_db directory does not exist, it will be created automatically on startup.


7. Start MongoDBEnsure MongoDB is running locally or provide a valid MONGO_DB_URL in the .env file.

8. Run the FastAPI server using (main.py)

9. Install the thunderclient extension in the visual studio

10. API Endpoints

Below is a summary of the main API endpoints. All endpoints except /auth/register and /auth/login require a JWT token in the Authorization header (format: Bearer <token>).


Authentication:

1. POST /auth/register: Register a new user.
http://localhost:3001/auth/register

body:json
{
  "name":"abc",
  "email":"abch@gmail.com",
  "password":"123456"
}

2. POST /auth/login: Log in and receive a JWT token.

body:Json
{
 ""email":"abch@gmail.com",
  "password":"123456"
}

header:(format: Bearer <token>)

Chatbot
POST /chatbot/query: Send a query to the chatbot.

body:
{
  "query": "I am feeling stress"
}

header:(format: Bearer <token>)

like you can test remaining end points
