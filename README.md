# Smart Medicine Ordering and Pharmacy Management Portal

**Academic Project (2026–2027)**  
*B.Tech IV Year I Semester — DevOps & Full Stack Development Final Project*  

---

## 1. Project Introduction & Abstract

### 1.1 Abstract
The **Smart Medicine Ordering and Pharmacy Management Portal** is a production-grade full stack enterprise healthcare solution developed to digitize, modernize, and secure end-to-end pharmaceutical supply chain operations. Traditional retail pharmacies face operational friction regarding doctor prescription validation, drug expiration waste, and delivery tracking. 

This portal bridges the gap between patients, licensed pharmacists, corporate administrators, and courier delivery drivers. It features role-based access control (RBAC), statutory doctor prescription verification (Schedule H drugs), First-Expired-First-Out (FEFO) batch inventory allocation, simulated sandbox checkout with card/UPI settlement, real-time five-stage delivery tracking, and four analytical reports powered by MongoDB aggregation pipelines.

### 1.2 Objectives
- **Zero-Trust Role Security**: Granular RBAC partitioning for Administrators, Pharmacists, Patients, and Delivery Drivers.
- **Statutory Rx Compliance**: Enforce clinical prescription verification prior to drug dispensation for scheduled medicines.
- **FEFO Batch Traceability**: Minimize expiration wastage through early warning monitoring (expiring in 30, 60, and 90 days).
- **Simulated Financial Settlement**: Sandbox payment gateway verifying instant authorization codes and transaction receipts.
- **DevOps Container Orchestration**: Microservices containerization with Docker, automated compose topology, and Kubernetes deployments.

---

## 2. Technology Stack

| Domain | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | **React.js (v18.3)** | Component-based reactive user interface |
| **Styling & Design** | **HTML5 & CSS3** | Custom clinical design system (Blue & Green theme) |
| **Icons & Visuals** | **Lucide React** | Medical, diagnostic, and dashboard iconography |
| **Routing** | **React Router (v6)** | Dynamic client-side routing & route guards |
| **HTTP Client** | **Axios** | REST client with automated JWT request interceptors |
| **Backend Framework** | **Node.js & Express.js** | High-performance asynchronous REST API |
| **Database & ODM** | **MongoDB & Mongoose (v8)** | NoSQL document storage & schema validation |
| **Authentication** | **JWT & Bcrypt.js** | Stateless JSON Web Tokens & salted password hashing |
| **File Handling** | **Multer** | Multipart prescription image and PDF document upload |
| **DevOps & Containers** | **Docker & Docker Compose** | Multi-stage image builds and container networking |
| **Orchestration** | **Kubernetes (K8s)** | Declarative deployments, services, NodePort, and ConfigMaps |

---

## 3. System Architecture & Topology

```
                          +-----------------------------------+
                          |      Web Browser (Port 5173 / 80) |
                          |   React.js 18 Single Page App     |
                          +-----------------+-----------------+
                                            |
                              REST API via Axios / Reverse Proxy
                                            |
                                            v
                          +-----------------+-----------------+
                          |  Express REST API Backend (5000)  |
                          |  JWT Auth | Multer | Controllers  |
                          +--------+-----------------+--------+
                                   |                 |
                   Mongoose ODM / TCP 27017    Prescription Storage
                                   |                 |
                                   v                 v
                      +------------+----+     +------+-------+
                      | MongoDB Cluster |     | uploads/ dir |
                      | Collections     |     | (JPG, PDF)   |
                      +-----------------+     +--------------+
```

---

## 4. User Roles & Access Control (RBAC)

The portal implements 4 distinct roles, each equipped with dedicated views and permissions:

1. **Administrator (Executive)**:
   - Platform analytics, financial metrics, and total settled revenue.
   - User account lifecycle (role reassignment and account activation).
   - Category hierarchy configuration.
   - Global order and inventory audits.
   - Access to all 4 mandatory reports.

2. **Pharmacist (Clinical Dispenser)**:
   - Verification queue for doctor prescriptions (Approve / Reject with dosage remarks).
   - Inventory management: CRUD operations on pharmaceutical products.
   - Warehouse batch allocation (manufacturing, expiry dates, supplier details).
   - Real-time low-stock alerts and expiration monitoring.
   - Order fulfillment pipeline (Confirm -> Pack -> Dispatch).

3. **Customer / Patient**:
   - Medicine search with generic chemical salt indexing and category filters.
   - Prescription file upload (JPG, PNG, PDF) with clinic and doctor details.
   - Shopping cart with automatic Schedule H prescription requirement checks.
   - Simulated test checkout (Credit Card, UPI, and Cash on Delivery).
   - Real-time five-stage order tracking with delivery associate contact.

4. **Delivery Partner (Fleet Logistics)**:
   - Dedicated courier console showing assigned parcels.
   - Recipient address details, contact phone, and route instructions.
   - Status transitions: *Picked Up* -> *Out for Delivery* -> *Delivered*.
   - Delivery verification code validation.
   - Historical completion records.

---

## 5. Minimum 12 Connected Screens

1. **Login & Registration Page** (`/login`, `/register`) — Features 1-click academic demo credentials.
2. **Customer Dashboard** (`/customer/dashboard`) — Active order tracker, prescription shortcuts, in-stock essentials.
3. **Medicine Listing & Search Page** (`/medicines`) — Live search, category pills, price and Rx filters.
4. **Medicine Details Page** (`/medicines/:id`) — Clinical indications, dosage form, active FEFO batches, quantity selector.
5. **Prescription Upload Page** (`/prescriptions`) — Document upload, doctor notes, and verification history.
6. **Shopping Cart & Checkout Page** (`/cart`) — Item adjustments, GST tax, prescription attachment, sandbox payment gateway.
7. **Order Tracking Page** (`/orders/:id/track`) — Interactive stepper: Placed -> Confirmed -> Packed -> Out for Delivery -> Delivered.
8. **Pharmacist Dashboard** (`/pharmacist/dashboard`) — Incoming order queue, prescription review modal, stock thresholds.
9. **Medicine Inventory Management Page** (`/pharmacist/inventory`) — Medicine CRUD and batch allocation.
10. **Admin Dashboard** (`/admin/dashboard`) — Executive KPI telemetry, role donut charts, user management.
11. **Delivery Partner Dashboard** (`/delivery/dashboard`) — Assigned deliveries, location routing, status updates.
12. **Reports & Analytics Page** (`/reports`) — 4 mandatory reports with live MongoDB aggregation and CSV export.

---

## 6. Four Mandatory Reports (MongoDB Aggregation)

### Report 1: Medicine Sales Report
- **Aggregation Pipeline**: `$match` (settled orders), `$unwind` (`items`), `$group` by medicine ID, `$lookup` category.
- **Metrics**: Total units sold, gross sales revenue, average transaction price, current stock.
- **Visuals**: Responsive SVG Bar Chart comparing revenue across formulations.

### Report 2: Medicine Stock Report
- **Aggregation Pipeline**: Real-time batch query mapping total stock against reorder thresholds.
- **Metrics**: Total medicines, total inventory valuation, healthy stock count, low stock count, stockout count.
- **Visuals**: Interactive Donut Distribution Chart (Healthy vs. Low vs. Out of Stock).

### Report 3: Expiry Tracking Report
- **Aggregation Pipeline**: FEFO date math classifying batches into risk horizons (<30 days, 31-60 days, 61-90 days, expired).
- **Metrics**: Financial asset loss at risk, days remaining until expiration, batch numbers, distributor names.
- **Visuals**: Expiry Horizon Distribution Donut Chart.

### Report 4: Customer Order Report
- **Aggregation Pipeline**: Order collection grouping with date range filters.
- **Metrics**: Total gross sales, Average Order Value (AOV), completion percentages, payment method breakdown.

*All 4 reports include Date Range Filters, Keyword Search, Summary Cards, and 1-Click **Export to CSV**.*

---

## 7. Database Design (Mongoose Models)

1. **User**: `name`, `email`, `password` (bcrypt), `role`, `phone`, `address`, `isActive`.
2. **Category**: `name`, `slug`, `description`, `icon`, `isActive`.
3. **Medicine**: `name`, `genericName`, `brand`, `category` (ref Category), `price`, `prescriptionRequired`, `dosageForm`, `strength`, `totalStock`, `reorderLevel`.
4. **MedicineBatch**: `medicine` (ref Medicine), `batchNumber`, `manufacturingDate`, `expiryDate`, `quantity`, `remainingQuantity`, `unitCost`, `supplier`, `status`.
5. **Prescription**: `customer` (ref User), `patientName`, `doctorName`, `prescriptionFile`, `status`, `reviewedBy`, `reviewNotes`, `validUntil`.
6. **Order**: `orderNumber`, `customer` (ref User), `items`, `subtotal`, `tax`, `deliveryFee`, `totalAmount`, `paymentMethod`, `paymentStatus`, `orderStatus`, `timeline`.
7. **Payment**: `order` (ref Order), `customer` (ref User), `amount`, `paymentMethod`, `transactionId`, `status`, `gatewayResponse`.
8. **Delivery**: `order` (ref Order), `deliveryPartner` (ref User), `status`, `deliveryAddress`, `deliveryCode`, `pickedUpAt`, `deliveredAt`.

---

## 8. Demo Login Credentials

For direct evaluation, use the 1-click quick login buttons on the login screen or enter manually:

| Role | Email Address | Password | Permissions & Dashboard |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@medipharm.com` | `Admin@123` | Full access, user roles, categories, reports |
| **Pharmacist** | `pharmacist@medipharm.com` | `Pharma@123` | Prescription approval, inventory CRUD, batches |
| **Customer** | `customer@medipharm.com` | `Customer@123` | Medicine ordering, prescription upload, cart, tracking |
| **Delivery** | `delivery@medipharm.com` | `Delivery@123` | Courier console, package pickup, live status update |

---

## 9. Local Installation & Execution

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### Step 1: Start Backend
```bash
cd backend
npm install
node server.js
```
*Note: The backend features an automatic zero-config fallback to an embedded in-memory MongoDB engine with automated seeding, so you don't even need an external MongoDB server running!*

### Step 2: Start Frontend
```bash
cd frontend
npm install
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## 10. DevOps: Docker & Container Execution

### Build & Run with Docker Compose
```bash
# Build all container images and launch the multi-tier stack
docker-compose up --build -d

# Verify container status
docker-compose ps

# View backend API logs
docker-compose logs -f backend

# Shut down stack
docker-compose down -v
```

Containers launched:
- `pharmacy_frontend` -> `http://localhost:80` (and `5173`)
- `pharmacy_backend` -> `http://localhost:5000`
- `pharmacy_mongodb` -> `mongodb://localhost:27017`

---

## 11. DevOps: Kubernetes Deployment (Minikube / Docker Desktop)

### Apply All Manifests
```bash
# 1. Create ConfigMap & Secret
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml

# 2. Deploy MongoDB Database
kubectl apply -f k8s/mongodb-deployment.yaml
kubectl apply -f k8s/mongodb-service.yaml

# 3. Deploy Backend API
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml

# 4. Deploy Frontend Web App
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml
```

### Verify Deployment Status
```bash
# Check Pods
kubectl get pods -l app=smart-pharmacy

# Check Services
kubectl get services -l app=smart-pharmacy

# For Minikube users to open the frontend:
minikube service frontend-service
```

---

## 12. GitHub Repository Setup Instructions

```bash
# Initialize local Git repository
git init

# Add remote origin
git remote add origin https://github.com/<your-username>/smart-medicine-portal.git

# Stage all files
git add .

# Create initial commit with conventional commit standards
git commit -m "feat: complete smart medicine ordering & pharmacy management portal with docker and k8s"

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## 13. Project Verification & Academic Evaluation Checklist

- [x] **4 Separate Roles** (Admin, Pharmacist, Customer, Delivery Partner) with RBAC.
- [x] **Minimum 12 Screens** fully built, styled, and functional.
- [x] **Statutory Prescription Upload & Review** with doctor verification notes.
- [x] **FEFO Inventory & Batch Tracking** with expiration monitoring.
- [x] **Shopping Cart & Checkout** with simulated Sandbox Payment Gateway (Card, UPI, COD).
- [x] **Interactive Order Tracking Stepper** with courier contact info.
- [x] **4 Mandatory Reports** with real MongoDB aggregations and CSV Export.
- [x] **Docker Multi-Stage Builds** (`backend/Dockerfile`, `frontend/Dockerfile`, `docker-compose.yml`).
- [x] **Kubernetes Configurations** (Deployments, Services, NodePort, ConfigMap, Secret).
- [x] **Rich Seed Data** pre-populated for immediate evaluation and presentation.

