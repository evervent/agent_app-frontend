export interface AgentProfile {
  id: string;
  agentId: string;
  irdaLicenseNumber: string | null;
  agencyName: string | null;
  city: string | null;
  state: string | null;
  experienceYears: number | null;
  productLines: string[];
  address: string | null;
  photographUrl: string | null;
  panNumber: string | null;
  bankAccountNumber: string | null;
  ifscCode: string | null;
  gstNumber: string | null;
  profileCompletionPercentage: number;
  createdAt: string;
  updatedAt: string;
}

export interface Workspace {
  id: string;
  agentId: string;
  businessName: string;
  city: string;
  state: string;
  productInterests: string[];
  teamType: 'solo' | 'team';
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfilePayload {
  irdaLicenseNumber?: string;
  agencyName?: string;
  city?: string;
  state?: string;
  experienceYears?: number;
  productLines?: string[];
  panNumber?: string;
  bankAccountNumber?: string;
  ifscCode?: string;
  gstNumber?: string;
}

export interface UpdateBusinessPayload {
  panNumber?: string;
  bankAccountNumber?: string;
  ifscCode?: string;
  gstNumber?: string;
}

export interface SetupWorkspacePayload {
  businessName: string;
  city: string;
  state: string;
  productInterests: string[];
  teamType: 'solo' | 'team';
}
