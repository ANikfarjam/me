from pinecone import Pinecone
from vectorDB import VectorDB
from rich.progress import Progress
import os
def add_files(path):
    return [path.join(root, f) for root, _, file in os.walk(path) for f in file]
with Progress() as p:
    task1 = p.add_task('Loading documents', total= 3)
    path = './Docs'
    #loading documents
    docs = {str(dir): add_files(dir) for _, directory, _ in os.walk(path) for dir in directory}
    p.update(task1, unit=1)
    #initializing db
    db = VectorDB()
    p.update(task1, unit=1)
    #create index for each 
    for key in docs.keys():
        db.create_index(key)
        print(f'created index for {key}')
    p.update(task1, unit=1)

    #preping documents
    task2 = p.add_task('Preparing documents', total= 1)
    for key in docs.keys():
        for doc in docs[key]:
            print(f'preparing {doc}')
            process_docs=db.prepare_documents(file_path=doc)
            db.upsert_documents(documents=process_docs)
    p.update(task2, unit=1)
            