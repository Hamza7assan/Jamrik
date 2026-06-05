import chromadb
import csv

print("Connecting to the local Vector Database...")
client = chromadb.PersistentClient(path="./jamrik_vectordb")

#Clean up the old database if it exists to avoid duplicates
try:
    client.delete_collection(name="jordanian_customs_laws")
except Exception:
    pass

#  Create new collection 
collection = client.create_collection(name="jordanian_customs_laws")

print("Reading 7000+ rows from CSV and converting to Vectors...")

csv_file_path = "customs_data.csv"
batch_size = 1000 # batch processing to protect ram usage

ids_batch = []
documents_batch = []
metadatas_batch = []

try:
    # 'utf-8-sig' handles potential Arabic encoding issues from Excel CSV exports
    with open(csv_file_path, mode='r', encoding='utf-8-sig') as file:
        reader = csv.reader(file)
        next(reader) # skip the column headers (HS Code, Item, Duty Rate)

        count = 0
        for row in reader:
            # Skip invalid or empty rows
            if len(row) < 3: 
                continue 

            hs_code = row[0].strip()
            description = row[1].strip()
            duty_rate = row[2].strip()

            ids_batch.append(f"law_{count}")
            documents_batch.append(description) 
            metadatas_batch.append({
                "hs_code": hs_code,
                "duty_rate": duty_rate
            })
            
            count += 1
            
            # Inject data into the database every 1000 rows.....yy=
            if len(ids_batch) == batch_size:
                collection.add(ids=ids_batch, documents=documents_batch, metadatas=metadatas_batch)
                print(f"✅ Successfully inserted {count} rows...")
                ids_batch.clear()
                documents_batch.clear()
                metadatas_batch.clear()

        # inject the final remaining batch
        if len(ids_batch) > 0:
            collection.add(ids=ids_batch, documents=documents_batch, metadatas=metadatas_batch)
            print(f"✅ Successfully inserted the final batch. Total rows: {count}")

except FileNotFoundError:
    print(f"❌ Error: Could not find '{csv_file_path}'. Please make sure it is in the same folder.")
except Exception as e:
    print(f"❌ Unexpected Error: {str(e)}")

print("🚀 Massive Vector Database build complete!")
