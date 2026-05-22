export type AgentRole = 'owner_agent' | 'sub_agent' | 'support_user' | 'viewer';
export type OnboardingStep = 'signup' | 'profile' | 'business' | 'workspace' | 'complete';

export interface Agent {
  id: string;
  fullName: string;
  mobile: string;
  email: string | null;
  isMobileVerified: boolean;
  onboardingStep: OnboardingStep;
  role: AgentRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  accountType: 'owner' | 'member' | 'guest';
  agent: Agent;
  onboardingStep: OnboardingStep;
}

export interface ContextItem {
  type: 'owner' | 'member';
  workspaceId: string;
  workspaceName: string;
  role: string;
}

export interface ContextSelectionResponse {
  requiresContextSelection: true;
  contexts: ContextItem[];
  preAuthToken: string;
  agent: Agent;
  onboardingStep: OnboardingStep;
}

export type SigninResponse = AuthResponse | ContextSelectionResponse;

export interface AcceptInvitePayload {
  token: string;
  mobile: string;
  otp: string;
}

export interface SignupPayload {
  fullName: string;
  mobile: string;
  email?: string;
  password: string;
}

export interface VerifyOtpPayload {
  mobile: string;
  otp: string;
}

export interface SigninPasswordPayload {
  mobile: string;
  password: string;
}
