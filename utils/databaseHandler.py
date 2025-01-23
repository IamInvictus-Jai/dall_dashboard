from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from dotenv import load_dotenv
from os import environ
load_dotenv()

class MongoDB:
    def __init__(self, database_name:str = "templates"):
        password = environ.get("MONGODB_PASSWORD")
        uri = f"mongodb+srv://itsinvictusjai:{password}@templates.iej66.mongodb.net/?retryWrites=true&w=majority&appName=templates"
        # Create a new client and connect to the server
        self.client = MongoClient(uri, server_api=ServerApi('1'))
        self.database = self.client[database_name]
    
    def count_documents(self, collection:str):
        return self.client[self.database][collection].count_documents({})
    
    def get_all_collections(self):
        return self.database.list_collection_names()
    
    def count_all_documents(self):
        return self.database.command("dbstats")['objects']
    
    def get_all_links(self):
        collections = self.get_all_collections()

        links = {}
        for collection in collections:
            docs = self.database[collection].find()
            links[collection] = []
            for doc in docs:
                doc['templates_url'].pop('original_template', None)
                links[collection].extend(list(doc.get("templates_url", {}).values()))
        
        return links
    
    def get_links_and_preferred(self):
        collections = self.get_all_collections()

        links_mapping = {}
        for collection in collections:
            docs = self.database[collection].find()
            links_mapping[collection] = []
            for doc in docs:
                doc['templates_url'].pop('original_template', None)
                obj = {
                    "links": doc['templates_url'],
                    "preferred_engine": doc['most_preferable_prompt']
                }
                links_mapping[collection].append(obj)
        
        return links_mapping