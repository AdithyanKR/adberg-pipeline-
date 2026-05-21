import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables from .env file
load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_ANON_KEY")

if not url or not key:
    raise ValueError("Missing SUPABASE_URL or SUPABASE_ANON_KEY in environment variables")

def get_supabase_client() -> Client:
    """
    Initializes and returns a Supabase client.
    """
    supabase: Client = create_client(url, key)
    return supabase

if __name__ == "__main__":
    # Test connection initialization
    client = get_supabase_client()
    print("Supabase client initialized successfully!")
