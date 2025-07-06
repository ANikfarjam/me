#!/usr/bin/env python3
import sys
from vectorDB import VectorDB

def delete_one(db: VectorDB, name: str):
    if name not in db.list_indexes():
        print(f"⚠️  Index '{name}' does not exist.")
        return
    if db.delete_index(name):
        print(f"Successfully deleted index '{name}'.")
    else:
        print(f"Failed to delete index '{name}'.")

def delete_all(db: VectorDB):
    idxs = db.list_indexes()
    if not idxs:
        print("⚠️  No indexes to delete.")
        return
    for name in idxs:
        print(f"→ Deleting '{name}'…", end=" ")
        db.delete_index(name)
    print("✔ All done.")

def main():
    db = VectorDB()
    if len(sys.argv) == 1 or sys.argv[1] in ("-h", "--help"):
        print("Usage:")
        print("  python delete_indexes.py all          # delete every index")
        print("  python delete_indexes.py <index_name> # delete just that one")
        sys.exit(0)

    arg = sys.argv[1].lower()
    if arg == "all":
        delete_all(db)
    else:
        delete_one(db, arg)

if __name__ == "__main__":
    main()
