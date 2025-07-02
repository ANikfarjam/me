"""from pinecone import Pinecone
import os
from dotenv import load_dotenv

# Call load_dotenv() to load the variables from .env into the environment
load_dotenv()

class VectorDB:
    def __init__(self):
        self.pc = Pinecone(api_key=os.getenv('Pinecone_API_Key'))

#util functions
    def get_index(self,index_name):
        return self.pc.get_index(index_name)
#indexing

# index_name = "developer-quickstart-py"
    def create_index(self,index_name):
        if not self.pc.has_index(index_name):
            self.pc.create_index_for_model(
                name=index_name,
                cloud="aws",
                region="us-east-1",
                embed={
                    "model":"llama-text-embed-v2",
                    "field_map":{"text": "chunk_text"}
                }
    )
    #upstream documents
    def upstream_document(self, document, index_name):
        index = self.get_index(index_name)
        if index:
            index.upsert_records(index_name, document)
        else:
            return None
    """

from pinecone import Pinecone, ServerlessSpec
import os
from dotenv import load_dotenv
from typing import List, Dict, Optional
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.document_loaders import PyPDFLoader, UnstructuredMarkdownLoader
import hashlib

# Load environment variables
load_dotenv()

class VectorDB:
    def __init__(self):
        """Initialize Pinecone client and setup default configurations"""
        self.pc = Pinecone(api_key=os.getenv('Pinecone_API_Key'))
        self.default_embedding_model = "text-embedding-3-small"
        self.default_dimension = 1536  # For text-embedding-3-small
        
    # Utility functions
    def get_index(self, index_name: str):
        """Get an existing Pinecone index"""
        try:
            return self.pc.Index(index_name)
        except Exception as e:
            print(f"Error getting index {index_name}: {str(e)}")
            return None
    
    def list_indexes(self) -> List[str]:
        """List all available indexes"""
        return self.pc.list_indexes().names()
    
    def index_stats(self, index_name: str) -> Optional[Dict]:
        """Get statistics for an index"""
        index = self.get_index(index_name)
        return index.describe_index_stats() if index else None
    
    # Index management
    def create_index(self, index_name: str, dimension: int = None, metric: str = "cosine"):
        """Create a new Pinecone index"""
        if index_name in self.list_indexes():
            print(f"Index {index_name} already exists")
            return self.get_index(index_name)
        
        try:
            dimension = dimension or self.default_dimension
            self.pc.create_index(
                name=index_name,
                dimension=dimension,
                metric=metric,
                spec=ServerlessSpec(
                    cloud="aws",
                    region="us-east-1"
                )
            )
            print(f"Created index {index_name} with dimension {dimension}")
            return self.get_index(index_name)
        except Exception as e:
            print(f"Error creating index {index_name}: {str(e)}")
            return None
    
    def delete_index(self, index_name: str) -> bool:
        """Delete an existing index"""
        if index_name not in self.list_indexes():
            print(f"Index {index_name} does not exist")
            return False
        
        try:
            self.pc.delete_index(index_name)
            print(f"Deleted index {index_name}")
            return True
        except Exception as e:
            print(f"Error deleting index {index_name}: {str(e)}")
            return False
    
    # Document processing
    def _generate_id(self, text: str) -> str:
        """Generate a unique ID for a text chunk"""
        return hashlib.md5(text.encode()).hexdigest()
    
    def _load_document(self, file_path: str) -> List[Dict]:
        """Load and split a document into chunks"""
        try:
            if file_path.endswith('.pdf'):
                loader = PyPDFLoader(file_path)
                pages = loader.load()
                text_splitter = RecursiveCharacterTextSplitter(
                    chunk_size=1000,
                    chunk_overlap=200
                )
                return text_splitter.split_documents(pages)
            elif file_path.endswith('.md'):
                loader = UnstructuredMarkdownLoader(file_path)
                pages = loader.load()
                text_splitter = RecursiveCharacterTextSplitter(
                    chunk_size=1000,
                    chunk_overlap=200
                )
                return text_splitter.split_documents(pages)
            else:
                print(f"Unsupported file type: {file_path}")
                return []
        except Exception as e:
            print(f"Error loading document {file_path}: {str(e)}")
            return []
    
    def prepare_documents(self, file_path: str, metadata: Dict = None) -> List[Dict]:
        """Prepare documents for upserting to Pinecone"""
        document_chunks = self._load_document(file_path)
        prepared_docs = []
        
        for chunk in document_chunks:
            doc_id = self._generate_id(chunk.page_content)
            prepared_docs.append({
                "id": doc_id,
                "values": None,  # Will be populated with embeddings
                "metadata": {
                    **chunk.metadata,
                    **(metadata or {}),
                    "text": chunk.page_content,
                    "source": file_path
                }
            })
        
        return prepared_docs
    
    # Vector operations
    def upsert_documents(self, documents: List[Dict], index_name: str, batch_size: int = 100) -> bool:
        """Upsert documents to a Pinecone index"""
        index = self.get_index(index_name)
        if not index:
            print(f"Index {index_name} not found")
            return False
        
        try:
            # Process in batches to avoid timeouts
            for i in range(0, len(documents), batch_size):
                batch = documents[i:i + batch_size]
                index.upsert(vectors=batch)
            print(f"Upserted {len(documents)} documents to {index_name}")
            return True
        except Exception as e:
            print(f"Error upserting documents: {str(e)}")
            return False
    
    def query_index(self, index_name: str, query_embedding: List[float], top_k: int = 5, 
                   filter: Dict = None) -> List[Dict]:
        """Query a Pinecone index"""
        index = self.get_index(index_name)
        if not index:
            print(f"Index {index_name} not found")
            return []
        
        try:
            results = index.query(
                vector=query_embedding,
                top_k=top_k,
                filter=filter,
                include_metadata=True
            )
            return results.matches
        except Exception as e:
            print(f"Error querying index: {str(e)}")
            return []