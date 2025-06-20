
export interface User {
  id: string;
  name: string;
  email: string;
}

export interface LibraryPermission {
  userId: string;
  libraryId: string;
  role: "administrator" | "operator";
  grantedAt: Date;
  grantedBy: string;
}

export interface PermissionRequest {
  id: string;
  userId: string;
  libraryId: string;
  requestedRole: "administrator" | "operator";
  reason: string;
  status: "pending" | "approved" | "rejected";
  requestedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
}
