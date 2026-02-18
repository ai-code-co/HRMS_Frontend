// types/inventory.ts

// --- API Response Types ---
export interface DeviceTypeSummary {
  id: number;
  name: string;
  description: string;
  total: number;
  working: number;
  assigned: number;
  unassigned: number;
}

export interface InventoryDashboardData {
  total_devices: number;
  total_assigned: number;
  total_unassigned: number;
  device_types: DeviceTypeSummary[];
  status_breakdown: { status: string; count: number }[];
}

export interface InventoryApiResponse {
  error: number;
  data: InventoryDashboardData;
}

// --- UI Interface (Used by Components) ---
export interface DeviceCategory {
  id: string;
  name: string;
  total: number;
  working: number;
  unassigned: number;
  icon: string; // Key to look up icon component
}

export interface InventoryItem {
  id: string; // Converted from number for UI consistency
  name: string;
  type: number;
  purchaseDate: string;
  purchase_price?: string;
  warrantyExpire: string;
  price: string;
  serialNumber: string;
  internalSerial: string;
  status: 'working' | 'repair' | 'unassigned';
  devicetypeName?: string;
  assignedTo?: string;
  designation?: string;
  photo_url?: string;
  warranty_doc_url?: string;
  invoice_doc_url?: string;
}

// --- NEW: Device List API Types ---
export interface DeviceApiObject {
  id: number;
  device_type: number;
  device_type_name: string;
  serial_number: string;
  model_name: string;
  brand: string;
  status: 'working' | 'repair' | 'unassigned' | string;
  status_display: string;
  condition: string;
  condition_display: string;
  employee_name: string | null;
  purchase_date: string | null;
  warranty_expiry: string | null;
  is_active: boolean;
  created_at: string;
}

export interface DeviceListApiResponse {
  error: number;
  data: DeviceApiObject[];
}

export interface Comment {
  id: string;
  author: string;
  text: string;
  date: string;
  avatar: string;
}

export interface DeviceCommentApi {
  id: number;
  device: number;
  employee: number;
  employee_name: string;
  employee_photo: string;
  photo_url: string;
  comment: string;
  created_at: string;
  formatted_date: string;
}

export interface DeviceCommentsApiResponse {
  error: number;
  data: DeviceCommentApi[];
}
// --- NEW: Device Detail Types ---
export interface DeviceDetailApiObject {
  id: number;
  device_type: number;
  device_type_detail: {
    id: number;
    name: string;
    description: string;
  };
  serial_number: string;
  model_name: string;
  brand: string;
  status: string;
  status_display: string;
  condition: string;
  condition_display: string;
  employee: any;
  employee_detail: any; // Define strict type if needed
  purchase_date: string | null;
  purchase_price: string;
  warranty_expiry: string | null;
  is_under_warranty: boolean;
  notes: string;
  is_active: boolean;
  is_assigned: boolean;
  created_at: string;
  updated_at: string;
  photo_url?: string;
  warranty_doc_url?: string;
  invoice_doc_url?: string;
}

