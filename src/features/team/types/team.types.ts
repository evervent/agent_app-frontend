export interface TeamMemberAgent {
  id: string;
  fullName: string;
  mobile: string;
  email: string | null;
  role: string;
}

export interface TeamMemberRole {
  id: string;
  name: string;
  description: string | null;
}

export interface TeamMember {
  id: string;
  workspaceId: string;
  agentId: string;
  roleId: string;
  isActive: boolean;
  joinedAt: string;
  agent: TeamMemberAgent;
  role: TeamMemberRole;
}

export interface Role {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
}

export interface InviteMemberPayload {
  mobile?: string;
  email?: string;
  roleId: string;
}

export interface UpdateMemberPayload {
  roleId?: string;
  isActive?: boolean;
}
