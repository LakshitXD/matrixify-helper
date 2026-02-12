# Matrixify Helper – Pre-Upload Validator

A minimal web app that validates Shopify Matrixify CSV files before upload. Upload a CSV and detect common import errors (missing columns, duplicate SKUs, missing option values, empty handles, column name typos). No auth, database, or storage—everything runs in memory.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Upload a CSV (max **10MB**) to validate.

## Sample Files

Test the validators with the sample CSVs in `public/samples/`:

- **valid.csv** – All required columns, unique SKUs, ready for Matrixify.
- **invalid.csv** – Missing required column (Option1 Value), empty Handle with multiple variants.
- **duplicate-sku.csv** – Duplicate Variant SKU values (SKU-DUP in rows 2, 3, 5).

Download from `/samples/valid.csv`, `/samples/invalid.csv`, `/samples/duplicate-sku.csv` when running the app.

## Deploy on Vercel

```bash
vercel
```

Or connect your Git repo to Vercel. The API route accepts POST with a `file` field (max 10MB CSV).
