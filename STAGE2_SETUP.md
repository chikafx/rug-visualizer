# RugRoom Stage 2 — Firebase + Cloudinary

## 1. Firebase
Create a Firebase project and register a Web App. Copy the Web App configuration values into `.env.local` using `.env.example` as the template.

In Firebase Console:
- Firestore Database → Create database
- Authentication → enable Email/Password (we will secure `/admin` in the next pass)

For local development, start with Firestore in test mode only if this is a temporary development project. Before production, replace it with locked rules.

## 2. Cloudinary
Create a Cloudinary account. In Settings → Upload Presets, create an **Unsigned** upload preset. Put the cloud name and preset name in `.env.local`.

The admin page uploads the rug image directly to Cloudinary, then saves the resulting secure URL and rug metadata to Firestore.

## 3. Install dependencies
Run:

`npm install`

The project now declares the Firebase web SDK. This environment could not download npm packages, so `node_modules` is intentionally not included in this ZIP.

## 4. Run

`npm run dev`

Open `/admin` and add the first rug. Then open `/visualize`; live available rugs will load from Firestore.

## Firestore collection
The application creates:

`rugs/{rugId}`

with name, SKU, price, currency, colour, sizes, image URL, availability, and createdAt.
