# Aromas distributors - B2B Product Supply Chain Platform

A streamlined B2B farm-to-table supply chain application that connects local vegetable farmers with wholesale buyers like restaurants and grocery stores. 

This platform allows farmers to easily log their fresh harvests, while the main office (Admin) manages total stock inventory, tracks wholesale client orders, and approves incoming farm produce.

## 🌟 Key Features

### For Farmers
* **Secure Profile:** Create an account and log into a personal farm profile.
* **Add Products:** Easily log fresh vegetable batches with their specific weight and harvest date.
* **Track Deliveries & Bills:** View pending deliveries waiting for approval and track statements for unpaid payouts.

### For Admins (Fine Aromas Management)
* **Quality Control Queue:** Receive, inspect, and approve incoming vegetable batches from farmers to add them to total sellable stock.
* **Inventory Management:** View a real-time combined list of available vegetable stock.
* **B2B(clients) Order Management:** Create new orders for wholesale clients, view order histories, and securely close orders upon completion.

---

## 📂 Project Architecture

The project is structured as a monorepo with completely separate frontend and backend folders to ensure clean, decoupled development.

```text
Aromas-distributors-app/                 # Main root repository
│
├── backend/                    # --- FLASK BACKEND API ---
│   ├── app/                    # Main python application code
│   │   ├── auth/               # Blueprint for registration and login
│   │   ├── farmer/             # Blueprint for farmer endpoints
│   │   └── admin/              # Blueprint for admin endpoints
│   ├── venv/                   # Python virtual environment (ignored by Git)
│   ├── requirements.txt        # Backend dependencies
│   └── run.py                  # Entry point to run the Flask server
│
└── frontend/                   # --- REACT FRONTEND UI ---
    ├── src/                    # React components, contexts, and pages
    │   ├── components/         # Reusable UI parts (Navbars, Forms)
    │   ├── context/            # AuthContext for handling login tokens
    │   └── pages/              # Farmer and Admin dashboard layouts
    ├── index.html              # Entry point HTML file
    ├── package.json            # Frontend node packages
    