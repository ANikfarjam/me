# import os
# from vectorDB import VectorDB
# from rich.progress import Progress

# def add_files(dir_path: str):
#     # use os.path.join, not dir_path.join
#     return [
#         os.path.join(root, f)
#         for root, _, files in os.walk(dir_path)
#         for f in files
#     ]

# base_path = "./Docs"
# # build a dict: category -> list of real filepaths
# docs = {
#     category: add_files(os.path.join(base_path, category))
#     for category in os.listdir(base_path)
#     if os.path.isdir(os.path.join(base_path, category))
# }

# db = VectorDB()

# with Progress() as p:
#     task1 = p.add_task("Creating indexes", total=len(docs))
#     # 1) create indexes
#     for category in docs:
#         db.create_index(category)
#         print(f"✔ created index for '{category}'")
#         p.update(task1, advance=1)

#     # 2) prepare & upsert
#     task2 = p.add_task("Ingesting documents", total=sum(len(d) for d in docs.values()))
#     for category, file_list in docs.items():
#         for fp in file_list:
#             print(f"→ preparing {fp}")
#             process_docs = db.prepare_documents(file_path=fp)
#             # now pass index_name explicitly
#             success = db.upsert_documents(documents=process_docs, index_name=category)
#             if not success:
#                 print(f"⚠️  failed to upsert docs for {category}")
#             p.update(task2, advance=1)

import os
from vectorDB import VectorDB
from rich.progress import Progress

def add_files(dir_path: str):
    return [
        os.path.join(root, f)
        for root, _, files in os.walk(dir_path)
        for f in files
    ]

base_path = "./Docs"
docs = {
    category: add_files(os.path.join(base_path, category))
    for category in os.listdir(base_path)
    if os.path.isdir(os.path.join(base_path, category))
}

db = VectorDB()

# First delete existing indexes to ensure clean setup
for category in docs:
    db.delete_index(category)

with Progress() as p:
    task1 = p.add_task("Creating indexes", total=len(docs))
    # Create indexes with correct dimension (384)
    for category in docs:
        db.create_index(category, dimension=384)
        print(f"✔ created index for '{category}'")
        p.update(task1, advance=1)

    # Prepare & upsert documents
    task2 = p.add_task("Ingesting documents", total=sum(len(d) for d in docs.values()))
    for category, file_list in docs.items():
        for fp in file_list:
            print(f"→ preparing {fp}")
            process_docs = db.prepare_documents(file_path=fp)
            if process_docs:  # Only upsert if documents were prepared successfully
                success = db.upsert_documents(documents=process_docs, index_name=category)
                if not success:
                    print(f"⚠️ failed to upsert docs for {category}")
            p.update(task2, advance=1)