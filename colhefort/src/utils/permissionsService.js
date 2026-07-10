// Granular Permission System

const PERMISSIONS = {
  // Sales
  CREATE_SALE: 'create_sale',
  EDIT_SALE: 'edit_sale',
  DELETE_SALE: 'delete_sale',
  VIEW_SALES: 'view_sales',
  
  // Purchases
  CREATE_PURCHASE: 'create_purchase',
  EDIT_PURCHASE: 'edit_purchase',
  DELETE_PURCHASE: 'delete_purchase',
  VIEW_PURCHASES: 'view_purchases',
  
  // Products
  CREATE_PRODUCT: 'create_product',
  EDIT_PRODUCT: 'edit_product',
  DELETE_PRODUCT: 'delete_product',
  VIEW_PRODUCTS: 'view_products',
  
  // Clients
  CREATE_CLIENT: 'create_client',
  EDIT_CLIENT: 'edit_client',
  DELETE_CLIENT: 'delete_client',
  VIEW_CLIENTS: 'view_clients',
  
  // Machines
  CREATE_MACHINE: 'create_machine',
  EDIT_MACHINE: 'edit_machine',
  DELETE_MACHINE: 'delete_machine',
  VIEW_MACHINES: 'view_machines',
  
  // Allocations
  CREATE_ALLOCATION: 'create_allocation',
  EDIT_ALLOCATION: 'edit_allocation',
  DELETE_ALLOCATION: 'delete_allocation',
  VIEW_ALLOCATIONS: 'view_allocations',
  APPROVE_ALLOCATION: 'approve_allocation',
  
  // Expenses
  CREATE_EXPENSE: 'create_expense',
  EDIT_EXPENSE: 'edit_expense',
  DELETE_EXPENSE: 'delete_expense',
  VIEW_EXPENSES: 'view_expenses',
  
  // Reports
  VIEW_REPORTS: 'view_reports',
  EXPORT_DATA: 'export_data',
  
  // Users
  CREATE_USER: 'create_user',
  EDIT_USER: 'edit_user',
  DELETE_USER: 'delete_user',
  VIEW_USERS: 'view_users',
  
  // Settings
  MANAGE_SETTINGS: 'manage_settings',
  VIEW_AUDIT_LOG: 'view_audit_log',
};

const ROLE_PERMISSIONS = {
  admin: [
    // All permissions for admin
    ...Object.values(PERMISSIONS),
  ],
  manager: [
    // Sales
    PERMISSIONS.CREATE_SALE,
    PERMISSIONS.EDIT_SALE,
    PERMISSIONS.DELETE_SALE,
    PERMISSIONS.VIEW_SALES,
    
    // Purchases
    PERMISSIONS.CREATE_PURCHASE,
    PERMISSIONS.EDIT_PURCHASE,
    PERMISSIONS.DELETE_PURCHASE,
    PERMISSIONS.VIEW_PURCHASES,
    
    // Products
    PERMISSIONS.CREATE_PRODUCT,
    PERMISSIONS.EDIT_PRODUCT,
    PERMISSIONS.DELETE_PRODUCT,
    PERMISSIONS.VIEW_PRODUCTS,
    
    // Clients
    PERMISSIONS.CREATE_CLIENT,
    PERMISSIONS.EDIT_CLIENT,
    PERMISSIONS.DELETE_CLIENT,
    PERMISSIONS.VIEW_CLIENTS,
    
    // Machines
    PERMISSIONS.CREATE_MACHINE,
    PERMISSIONS.EDIT_MACHINE,
    PERMISSIONS.DELETE_MACHINE,
    PERMISSIONS.VIEW_MACHINES,
    
    // Allocations
    PERMISSIONS.CREATE_ALLOCATION,
    PERMISSIONS.EDIT_ALLOCATION,
    PERMISSIONS.DELETE_ALLOCATION,
    PERMISSIONS.VIEW_ALLOCATIONS,
    PERMISSIONS.APPROVE_ALLOCATION,
    
    // Expenses
    PERMISSIONS.CREATE_EXPENSE,
    PERMISSIONS.EDIT_EXPENSE,
    PERMISSIONS.DELETE_EXPENSE,
    PERMISSIONS.VIEW_EXPENSES,
    
    // Reports
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.EXPORT_DATA,
    
    // Users
    PERMISSIONS.VIEW_USERS,
  ],
  operator: [
    // Sales
    PERMISSIONS.CREATE_SALE,
    PERMISSIONS.VIEW_SALES,
    
    // Products
    PERMISSIONS.VIEW_PRODUCTS,
    
    // Clients
    PERMISSIONS.VIEW_CLIENTS,
    
    // Machines
    PERMISSIONS.VIEW_MACHINES,
    
    // Allocations
    PERMISSIONS.VIEW_ALLOCATIONS,
    
    // Expenses
    PERMISSIONS.VIEW_EXPENSES,
    
    // Reports
    PERMISSIONS.VIEW_REPORTS,
  ],
  producer: [
    // Sales
    PERMISSIONS.CREATE_SALE,
    PERMISSIONS.VIEW_SALES,
    
    // Products
    PERMISSIONS.VIEW_PRODUCTS,
    
    // Clients
    PERMISSIONS.VIEW_CLIENTS,
    
    // Machines
    PERMISSIONS.VIEW_MACHINES,
    
    // Allocations
    PERMISSIONS.VIEW_ALLOCATIONS,
    
    // Reports
    PERMISSIONS.VIEW_REPORTS,
  ],
};

class PermissionsService {
  constructor() {
    this.PERMISSIONS = PERMISSIONS;
    this.ROLE_PERMISSIONS = ROLE_PERMISSIONS;
  }

  // Check if user has specific permission
  hasPermission(userRole, permission) {
    if (!userRole) return false;
    
    const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
    return rolePermissions.includes(permission);
  }

  // Check if user has any of the specified permissions
  hasAnyPermission(userRole, permissions) {
    if (!userRole) return false;
    
    const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
    return permissions.some(permission => rolePermissions.includes(permission));
  }

  // Check if user has all of the specified permissions
  hasAllPermissions(userRole, permissions) {
    if (!userRole) return false;
    
    const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
    return permissions.every(permission => rolePermissions.includes(permission));
  }

  // Get all permissions for a role
  getRolePermissions(userRole) {
    return ROLE_PERMISSIONS[userRole] || [];
  }

  // Check if user can approve allocations
  canApproveAllocation(userRole) {
    return this.hasPermission(userRole, PERMISSIONS.APPROVE_ALLOCATION);
  }

  // Check if user can manage users
  canManageUsers(userRole) {
    return this.hasPermission(userRole, PERMISSIONS.CREATE_USER);
  }

  // Check if user can view audit logs
  canViewAuditLogs(userRole) {
    return this.hasPermission(userRole, PERMISSIONS.VIEW_AUDIT_LOG);
  }

  // Check if user can export data
  canExportData(userRole) {
    return this.hasPermission(userRole, PERMISSIONS.EXPORT_DATA);
  }

  // Check if user can delete records
  canDeleteRecords(userRole, collection) {
    const deletePermission = `delete_${collection.slice(0, -1)}`; // Remove 's' from plural
    return this.hasPermission(userRole, PERMISSIONS[deletePermission.toUpperCase()]);
  }
}

export const permissionsService = new PermissionsService();
export { PERMISSIONS, ROLE_PERMISSIONS };
