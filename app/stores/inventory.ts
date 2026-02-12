import { defineStore } from 'pinia';
import type {
    InventoryApiResponse,
    DeviceListApiResponse,
    DeviceDetailApiObject,
    DeviceCommentsApiResponse,
    InventoryItem,
    DeviceCategory,
    InventoryDashboardData,
    DeviceApiObject,
    Comment
} from '../types/inventory';
import { extractErrorMessage } from '~/composables/useErrorMessage';
import useApi from '~/composables/useApi';

function getIconName(name: string): string {
    const n = name.toLowerCase();
    if (n.includes('mobile') || n.includes('phone')) return 'Smartphone';
    if (n.includes('laptop')) return 'Laptop';
    if (n.includes('mouse')) return 'MousePointer2';
    if (n.includes('keyboard')) return 'Keyboard';
    if (n.includes('charger') || n.includes('power')) return 'Zap';
    if (n.includes('monitor') || n.includes('screen') || n.includes('display')) return 'Monitor';
    if (n.includes('camera') || n.includes('webcam')) return 'Camera';
    if (n.includes('ac') || n.includes('conditioner')) return 'AirVent';
    if (n.includes('light')) return 'Lightbulb';
    if (n.includes('wifi') || n.includes('modem')) return 'Wifi';
    if (n.includes('headphone') || n.includes('audio')) return 'Headphones';
    return 'CircleDashed';
}

export const useInventoryStore = defineStore('inventory', {
    state: () => ({
        dashboardData: null as InventoryDashboardData | null,
        loadingDashboard: false,
        rawDevices: [] as DeviceApiObject[],
        loadingDevices: false,
        currentDeviceDetail: null as DeviceDetailApiObject | null,
        loadingDetail: false,

        deviceComments: [] as Comment[],
        loadingComments: false,

        error: null as string | null,
    }),

    getters: {
        totalDevices: (state) => state.dashboardData?.total_devices ?? 0,
        categories: (state): DeviceCategory[] => {
            if (!state.dashboardData?.device_types) return [];

            return state.dashboardData.device_types.map((dt) => ({
                id: dt.id.toString(),
                name: dt.name,
                total: dt.total,
                working: dt.working,
                unassigned: dt.unassigned,
                icon: getIconName(dt.name)
            }));
        },

        inventoryItems: (state): InventoryItem[] => {
            return state.rawDevices.map((device) => ({
                id: device.id.toString(),
                name: device.model_name || device.device_type_name,
                type: device.id,
                purchaseDate: device.purchase_date || '-',
                warrantyExpire: device.warranty_expiry || '-',
                price: '-',
                serialNumber: device.serial_number,
                internalSerial: device.serial_number,
                devicetypeName: device.device_type_name || '',
                status: (device.status as 'working' | 'repair' | 'unassigned') || 'unassigned',
                assignedTo: device.employee_name || undefined
            }));
        },

        selectedDetailItem: (state): InventoryItem | null => {
            if (!state.currentDeviceDetail) return null;
            const d = state.currentDeviceDetail;
            console.log(d, "here is the device detail");
            return {
                id: d.id.toString(),
                name: d.model_name || d.device_type_detail?.name || 'Unknown Device',
                type: d.device_type_detail?.id,
                purchaseDate: d.purchase_date || '',
                warrantyExpire: d.warranty_expiry || '',
                price: d.purchase_price ? `$${d.purchase_price}` : '-',
                serialNumber: d.serial_number,
                internalSerial: d.serial_number,
                devicetypeName: d.device_type_detail?.name || '',
                purchase_price: d.purchase_price || '',
                status: (d.status as 'working' | 'repair' | 'unassigned') || 'unassigned',
                assignedTo: d.employee_detail?.full_name || undefined
            };
        }
    },

    actions: {
        async fetchDashboardSummary() {
            const toast = useToast();
            if (this.loadingDashboard) return null;
            this.loadingDashboard = true;
            try {
                const response = await useApi<InventoryApiResponse>('/api/inventory/summary/', { credentials: 'include' });
                if (response.error === 0 && response.data) {
                    this.dashboardData = response.data;
                    return response.data;
                }
                return null;
            } catch (err: any) {
                this.error = extractErrorMessage(err, 'Failed to fetch dashboard');
                toast.add({
                    title: 'Error',
                    description: this.error,
                    color: 'error'
                });
                return null;
            } finally {
                this.loadingDashboard = false;
            }
        },

        setDashboardData(data: InventoryDashboardData | null) {
            this.dashboardData = data;
        },

        async fetchDevicesByType(typeId: string | number, showLoading = true) {
            if (showLoading) {
                this.loadingDevices = true;
                this.rawDevices = [];
                this.currentDeviceDetail = null;
            }
            const toast = useToast();
            try {
                const response = await useApi<DeviceListApiResponse>(`/api/inventory/device-types/${typeId}/devices/`, { credentials: 'include' });
                if (response.error === 0 && Array.isArray(response.data)) {
                    this.rawDevices = response.data;
                }
                return response.data || [];
            } catch (err: any) {
                this.error = extractErrorMessage(err, 'Failed to fetch devices');
                toast.add({
                    title: 'Error',
                    description: this.error,
                    color: 'error'
                });
                return [];
            } finally {
                if (showLoading) {
                    this.loadingDevices = false;
                }
            }
        },

        async fetchUnassignedDevices(search = '', categoryId?: string | number, showLoading = true) {
            console.log('fetchUnassignedDevices', search, categoryId, showLoading);
            if (showLoading) {
                this.loadingDevices = true;
                this.rawDevices = [];
                this.currentDeviceDetail = null;
            }
            const toast = useToast();
            try {
                const params: any = { search };
                if (categoryId) {
                    params.category = categoryId;
                }
                
                // Use useApi composable instead of $fetch
                const response = await useApi<{ data: any[] }>('/api/inventory/devices/unassigned/', {
                    params
                });
                
                // Transform unassigned device response to match DeviceApiObject format
                let transformedDevices: DeviceApiObject[] = (response.data || []).map((device: any) => ({
                    id: device.id,
                    device_type: device.device_type || 0,
                    device_type_name: device.device_type_name || '',
                    serial_number: device.serial_number || '',
                    model_name: device.model_name || '',
                    brand: device.brand || '',
                    status: device.status || 'unassigned',
                    status_display: device.status_display || 'Unassigned',
                    condition: device.condition || '',
                    condition_display: device.condition_display || '',
                    employee_name: null, // Unassigned devices have no employee
                    purchase_date: device.purchase_date || null,
                    warranty_expiry: device.warranty_expiry || null,
                    is_active: device.is_active !== undefined ? device.is_active : true,
                    created_at: device.created_at || ''
                }));
                
                // If category filtering is not supported by API, filter client-side
                if (categoryId && transformedDevices.length > 0) {
                    const categoryIdStr = categoryId.toString();
                    transformedDevices = transformedDevices.filter(device => 
                        device.device_type && device.device_type.toString() === categoryIdStr
                    );
                }
                
                this.rawDevices = transformedDevices;
                return transformedDevices;
            } catch (err: any) {
                this.error = extractErrorMessage(err, 'Failed to fetch unassigned devices');
                toast.add({
                    title: 'Error',
                    description: this.error,
                    color: 'error'
                });
                return [];
            } finally {
                if (showLoading) {
                    this.loadingDevices = false;
                }
            }
        },

        async fetchDeviceDetail(deviceId: string | number, showLoading = true) {
            if (showLoading) {
                this.loadingDetail = true;
            }
            const toast = useToast();
            try {
                const response = await useApi<DeviceDetailApiObject>(`/api/inventory/devices/${deviceId}/`, { credentials: 'include' });
                this.currentDeviceDetail = response;
                return response;
            } catch (err: any) {
                this.error = extractErrorMessage(err, 'Failed to fetch device details');
                this.currentDeviceDetail = null;
                toast.add({
                    title: 'Error',
                    description: this.error,
                    color: 'error'
                });
                return null;
            } finally {
                if (showLoading) {
                    this.loadingDetail = false;
                }
            }
        },

        setDevicesData(devices: DeviceApiObject[]) {
            this.rawDevices = devices;
        },

        setDeviceDetail(detail: DeviceDetailApiObject | null) {
            this.currentDeviceDetail = detail;
        },

        async unassignDevice(deviceId: string | number): Promise<{ message: string } | null> {
            const toast = useToast();
            try {
                const res = await useApi<{ error: number; data: { message: string } }>(
                    `/api/inventory/devices/${deviceId}/unassign/`,
                    { method: 'POST', credentials: 'include' }
                );
                if (res?.error === 0 && res?.data?.message) {
                    toast.add({
                        title: 'Success',
                        description: res.data.message,
                        color: 'success'
                    });
                    return res.data;
                }
                return null;
            } catch (err: any) {
                this.error = extractErrorMessage(err, 'Failed to unassign device');
                toast.add({
                    title: 'Error',
                    description: this.error,
                    color: 'error'
                });
                return null;
            }
        },

        async fetchDeviceComments(deviceId: string | number | undefined): Promise<Comment[]> {
            if (deviceId === undefined || deviceId === null || deviceId === '') {
                this.deviceComments = [];
                return [];
            }
            this.loadingComments = true;
            try {
                const res = await useApi<DeviceCommentsApiResponse>(
                    `/api/inventory/devices/${deviceId}/comments/`,
                    { credentials: 'include' }
                );
                const list = res?.data ?? [];
                this.deviceComments = list.map((c) => ({
                    id: String(c.id),
                    author: c.employee_name,
                    text: c.comment,
                    date: c.formatted_date,
                    avatar: c.photo_url || '',
                }));
                return this.deviceComments;
            } catch {
                this.deviceComments = [];
                return [];
            } finally {
                this.loadingComments = false;
            }
        },

        async updateDevice(id: string | number, payload: Partial<any>) {
            this.error = null;
            try {

                const apiPayload = {
                    device_type: payload.device_type,
                    brand: payload.brand,
                    condition: payload.condition,
                    employee: payload.employee,
                    notes: payload.notes,
                    is_active: payload.is_active,
                    model_name: payload.name,
                    serial_number: payload.serial_number,
                    status: payload.status,
                    purchase_price: payload.purchase_price,
                    purchase_date: payload.purchase_date || null,
                    warranty_expiry: payload.warranty_expiry || null,
                };

                Object.keys(apiPayload).forEach(key => apiPayload[key] === undefined && delete apiPayload[key]);

                const updatedDevice = await useApi<DeviceDetailApiObject>(`/api/inventory/devices/${id}/`, {
                    method: 'PUT',
                    body: apiPayload,
                    credentials: 'include'
                });

                // Only update detail if API returned data (avoid blank screen on empty/odd response)
                if (updatedDevice && typeof updatedDevice === 'object') {
                    this.currentDeviceDetail = updatedDevice;
                }
                const index = this.rawDevices.findIndex(d => d.id.toString() === id.toString());
                if (index !== -1 && updatedDevice) {
                    this.rawDevices[index] = {
                        ...this.rawDevices[index],
                        serial_number: updatedDevice.serial_number,
                        model_name: updatedDevice.model_name,
                        status: updatedDevice.status,
                    };
                }

                return updatedDevice;
            } catch (err: any) {
                this.error = extractErrorMessage(err, 'Failed to update device');
                const toast = useToast();
                toast.add({
                    title: 'Error',
                    description: this.error,
                    color: 'error'
                });
                throw err;
            }
        },

        async deleteDevice(id: string | number) {
            this.error = null;
            try {
                await useApi(`/api/inventory/devices/${id}/`, {
                    method: 'DELETE',
                    credentials: 'include'
                });

                // Remove device from local state
                this.rawDevices = this.rawDevices.filter(d => d.id.toString() !== id.toString());
                if (this.currentDeviceDetail?.id.toString() === id.toString()) {
                    this.currentDeviceDetail = null;
                }

                // Refresh dashboard summary
                await this.fetchDashboardSummary();
            } catch (err: any) {
                this.error = extractErrorMessage(err, 'Failed to delete device');
                throw err;
            }
        },

        async createDevice(payload: {
            device_type: number;
            serial_number: string;
            model_name: string;
            brand: string;
            status: string;
            condition: string;
            employee?: number | null;
            purchase_date?: string;
            purchase_price?: string;
            warranty_expiry?: string;
            notes?: string;
            is_active: boolean;
            photo?: string | null;
            warranty_doc?: string | null;
            invoice_doc?: string | null;
        }) {
            this.error = null;
            const toast = useToast();
            try {
                const apiPayload: Record<string, unknown> = {
                    device_type: payload.device_type,
                    serial_number: payload.serial_number,
                    model_name: payload.model_name,
                    brand: payload.brand,
                    status: payload.status,
                    condition: payload.condition,
                    employee: payload.employee ?? null,
                    purchase_date: payload.purchase_date ?? null,
                    purchase_price: payload.purchase_price ?? null,
                    warranty_expiry: payload.warranty_expiry ?? null,
                    notes: payload.notes ?? '',
                    is_active: payload.is_active,
                };
                if (payload.photo != null && payload.photo !== '') apiPayload.photo = payload.photo;
                if (payload.warranty_doc != null && payload.warranty_doc !== '') apiPayload.warranty_doc = payload.warranty_doc;
                if (payload.invoice_doc != null && payload.invoice_doc !== '') apiPayload.invoice_doc = payload.invoice_doc;

                const newDevice = await useApi<DeviceDetailApiObject>('/api/inventory/devices/', {
                    method: 'POST',
                    body: apiPayload as Record<string, unknown>,
                    credentials: 'include'
                });

                // Refresh dashboard summary to update counts
                await this.fetchDashboardSummary();

                return newDevice;
            } catch (err: any) {
                this.error = extractErrorMessage(err, 'Failed to create device');
                toast.add({
                    title: 'Error',
                    description: this.error,
                    color: 'error'
                });
                throw err;
            }
        },
    },
});