import pandas as pd
import os

# Read the CSV file
df = pd.read_csv('german_english_vocabulary.csv')

# Create Excel file
excel_file = 'german_english_vocabulary.xlsx'
df.to_excel(excel_file, index=False, sheet_name='German Vocabulary')

print(f"Excel file created: {excel_file}")
print(f"Total words: {len(df)}")
print(f"Columns: {list(df.columns)}")
print("\nFirst 10 rows:")
print(df.head(10))
