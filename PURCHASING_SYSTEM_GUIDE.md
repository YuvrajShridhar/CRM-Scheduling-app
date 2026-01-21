# Purchase Order & Supplier Management System

## Overview
Complete purchasing management system with Purchase Orders (POs) and Suppliers, integrated into the PFSN Management System.

## Features Implemented

### 1. Supplier Management
- **Supplier List Page** (`suppliersLogPage`)
  - View all active and inactive suppliers
  - Click supplier to view detail page
  - Add new supplier button
  - Grouped by active/inactive status
  
- **Supplier Detail Page** (`supplierPage`)
  - Contact information display
  - Account information
  - Notes section
  - Edit and delete buttons
  - Back navigation to supplier list
  
- **Supplier Modal** (`supplierModal`)
  - Company name (required)
  - Contact name, phone, email
  - Address
  - Account number
  - Payment terms (Cash, 7/14/30/60/90 days)
  - Active/inactive toggle
  - Notes field
  - Add/edit/delete functionality

### 2. Purchase Order Management
- **Purchase Orders Page** (`purchaseOrdersPage`)
  - **Metrics Cards** (auto-calculated):
    - Open POs count
    - Total value of open POs
    - Awaiting delivery count
    - This month's spend
  
  - **Two List Views**:
    - Open POs (sent, acknowledged, partially delivered)
    - All POs with filters (status, supplier)
  
- **PO Modal** (`poModal`)
  - Auto-incrementing PO numbers (starting from 10001)
  - Supplier selection (dropdown)
  - Job linkage (mandatory, open jobs only)
  - PO date
  - Status workflow:
    - Sent → Acknowledged → Partially Delivered → Delivered → Closed/Cancelled
  - **Dynamic Line Items**:
    - Start with 2 lines
    - Add more with + button
    - Remove individual lines
    - Fields: Qty, Description, Unit Price, Total (auto-calculated)
  - Grand total auto-calculation
  - Notes field
  - Quick add supplier button

### 3. Database Structure

#### Suppliers Collection
```javascript
{
  company: string (required),
  contact: string,
  phone: string,
  email: string,
  address: string,
  accountNumber: string,
  paymentTerms: string,
  isActive: boolean,
  notes: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### Purchase Orders Collection
```javascript
{
  poNumber: string (auto-generated),
  supplierId: string (required),
  jobId: string (required),
  poDate: string,
  status: string,
  lineItems: [{
    quantity: number,
    description: string,
    unitPrice: number,
    total: number
  }],
  totalAmount: number,
  notes: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 4. Navigation Flow
```
Purchasing Page (main landing)
  ├─ Purchase Orders → Purchase Orders Page
  │   ├─ Create PO → PO Modal
  │   ├─ Edit PO → PO Modal
  │   └─ Back to Purchasing
  │
  └─ Suppliers → Suppliers Log Page
      ├─ Add Supplier → Supplier Modal
      ├─ Click Supplier → Supplier Detail Page
      │   ├─ Edit → Supplier Modal
      │   └─ Delete → Confirmation
      └─ Back to Purchasing
```

### 5. Key Functions

#### In `db.js`
- `listenForSuppliers()` - Real-time supplier data sync
- `listenForPurchaseOrders()` - Real-time PO data sync
- `addSupplier()`, `updateSupplier()`, `deleteSupplier()`
- `addPurchaseOrder()`, `updatePurchaseOrder()`, `deletePurchaseOrder()`

#### In `suppliers.js`
- `renderSuppliersLog()` - Display all suppliers
- `renderSupplierPage()` - Display supplier details

#### In `purchaseorders.js`
- `renderPurchaseOrdersPage()` - Main PO page with metrics
- `updatePOMetrics()` - Calculate dashboard metrics
- `renderOpenPOs()` - Display open purchase orders
- `renderAllPOs()` - Display all POs with filters
- `generatePONumber()` - Auto-increment from 10001
- `createLineItemHTML()` - Generate line item rows
- `populatePOSupplierFilter()` - Update supplier filter dropdown

#### In `app.js`
- `openSupplierModal()` - Open/populate supplier modal
- `openPOModal()` - Open/populate PO modal
- `updateLineItemListeners()` - Bind events to line items
- `updateLineTotal()` - Calculate line item totals
- `updatePOTotal()` - Calculate PO grand total
- `window.removeLineItem()` - Remove line from PO
- `window.openSupplierPage()` - Navigate to supplier detail
- `window.editPO()` - Open PO in edit mode

### 6. Application State Updates

Added to `config.js`:
```javascript
suppliers: [],
purchaseOrders: [],
currentSupplierId: null,
currentPOId: null,
isInitialDataLoaded: {
  suppliers: false,
  purchaseOrders: false
}
```

### 7. HTML Structure

#### New Pages
- `purchasingPage` - Main purchasing landing (with cards)
- `purchaseOrdersPage` - PO management page
- `suppliersLogPage` - Supplier list page
- `supplierPage` - Individual supplier detail page

#### New Modals
- `supplierModal` - Add/edit supplier
- `poModal` - Create/edit purchase order

### 8. Styling
- Green color scheme (#10b981) for purchasing section
- Consistent with existing system design
- Responsive grid layouts
- Status badges with appropriate colors
- Border-left color coding for PO statuses

## Usage

### Creating a Purchase Order
1. Navigate to Purchasing → Purchase Orders
2. Click "Create Purchase Order"
3. Select supplier (or quick-add new supplier)
4. Select job (open jobs only)
5. Set PO date and status
6. Add line items (qty, description, price)
7. Add more lines with + button if needed
8. Review total amount
9. Save

### Managing Suppliers
1. Navigate to Purchasing → Suppliers
2. Click "Add Supplier" to create new
3. Click existing supplier to view details
4. Edit or delete from detail page
5. Use active/inactive toggle to manage supplier status

### Viewing Metrics
The Purchase Orders page displays:
- Real-time count of open POs
- Total value of all open purchase orders
- Count of POs awaiting delivery
- Total spend for current month

### Filtering POs
Use the "All POs" tab to:
- Filter by status (sent, acknowledged, etc.)
- Filter by supplier
- View complete PO history

## Future Enhancements (Phase 2)
- PDF generation using jsPDF library
- Modernized PO template based on user's example
- Email PO to supplier
- Delivery tracking
- Stock integration
- Purchase history analytics
- Supplier performance metrics

## Notes
- PO numbers auto-increment from 10001
- Jobs must be open (not completed) to link to PO
- At least one line item required per PO
- Quick add supplier creates active supplier with just company name
- Supplier dropdown repopulates automatically after quick add
- All timestamps managed automatically by Firebase
