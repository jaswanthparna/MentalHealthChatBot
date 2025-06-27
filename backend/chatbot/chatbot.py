import os
from langchain_chroma import Chroma
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
from langchain_groq import ChatGroq

class Chatbot:
    def __init__(self):
        self.llm = None
        self.vector_db = None
        self.qa_chain = None

    def initialize_llm(self):
        """Initialize the Grok LLM with Groq API key."""
        if not os.getenv("GROQ_API_KEY"):
            raise ValueError("GROQ_API_KEY is not set in environment variables")
        try:
            self.llm = ChatGroq(
                temperature=0,
                model_name="llama3-70b-8192",
                groq_api_key=os.getenv("GROQ_API_KEY")
            )
            print("✅ LLM initialized successfully.")
        except Exception as e:
            print(f"Error initializing LLM: {str(e)}")
            raise

    def create_vector_db(self):
        """Create and persist a Chroma vector database from data.pdf."""
        data_path = "chatbot/data.pdf"
        if not os.path.exists(data_path):
            raise FileNotFoundError(f"Data file not found at {data_path}")
        try:
            loader = PyPDFLoader(data_path)
            documents = loader.load()
            text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
            texts = text_splitter.split_documents(documents)
            embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
            self.vector_db = Chroma.from_documents(
                documents=texts,
                embedding=embeddings,
                persist_directory="./vector_db/chroma_db"
            )
            print("✅ Chroma vector DB created and saved.")
        except Exception as e:
            print(f"Error creating vector DB: {str(e)}")
            raise

    def setup_qa_chain(self):
        """Set up the RetrievalQA chain with the vector DB and LLM."""
        try:
            retriever = self.vector_db.as_retriever()
            prompt_template = """You are a compassionate mental health chatbot. Respond thoughtfully to the following questions:
Context: {context}
User: {question}
Chatbot:"""
            PROMPT = PromptTemplate(
                template=prompt_template,
                input_variables=['context', 'question']
            )
            self.qa_chain = RetrievalQA.from_chain_type(
                llm=self.llm,
                chain_type="stuff",
                retriever=retriever,
                return_source_documents=True,
                chain_type_kwargs={"prompt": PROMPT}
            )
            print("✅ QA chain set up successfully.")
        except Exception as e:
            print(f"Error setting up QA chain: {str(e)}")
            raise

    async def process_query(self, query: str):
        """Process a user query asynchronously and return the chatbot response."""
        try:
            response = await self.qa_chain.acall(query)
            return response['result']
        except Exception as e:
            print(f"Error processing query: {str(e)}")
            raise

chatbot_instance = None

def initialize_chatbot():
    """Initialize chatbot components, loading or creating vector DB as needed."""
    global chatbot_instance
    try:
        db_path = "./vector_db/chroma_db"
        embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
        
        chatbot_instance = Chatbot()
        
        if not os.path.exists(db_path) or not os.listdir(db_path):
            chatbot_instance.create_vector_db()
        else:
            chatbot_instance.vector_db = Chroma(persist_directory=db_path, embedding_function=embeddings)
            print("✅ Loaded existing Chroma vector DB.")
        
        chatbot_instance.initialize_llm()
        chatbot_instance.setup_qa_chain()
        print("✅ Chatbot initialized successfully.")
    except Exception as e:
        print(f"Error initializing chatbot: {str(e)}")
        raise

async def process_query(query: str):
    """Global function to process queries using the initialized chatbot."""
    global chatbot_instance
    if not chatbot_instance:
        raise ValueError("Chatbot not initialized")
    return await chatbot_instance.process_query(query)