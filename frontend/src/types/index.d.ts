/**
 * TypeScript type definitions for API responses (IDE-only, not used in build)
 * These provide autocomplete and type checking in the IDE without requiring TypeScript compilation
 */

export type UserRole = "advertiser" | "campaign_manager" | "tech_support";

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
}

export type AssetCategory = "logo" | "image" | "copy" | "url" | "pending";

export interface Asset {
  id: string;
  user_id: string;
  filename: string;
  s3_key: string;
  s3_url: string;
  file_type: string;
  file_size_bytes: number;
  category: AssetCategory;
  categorization_method: string | null;
  uploaded_at: string; // ISO datetime string
}

export interface AssetUpdate {
  category?: AssetCategory;
}

export type CampaignStatus = "draft" | "pending_approval" | "approved" | "rejected";

export interface Campaign {
  id: string;
  advertiser_id: string;
  campaign_name: string;
  target_audience: string | null;
  campaign_goal: string | null;
  additional_notes: string | null;
  generated_email_html: string | null;
  generated_email_mjml: string | null;
  status: CampaignStatus;
  reviewed_by: string | null;
  reviewed_at: string | null; // ISO datetime string
  rejection_reason: string | null;
  scheduled_send_date: string | null; // ISO datetime string
  created_at: string; // ISO datetime string
  updated_at: string; // ISO datetime string
}

export interface CampaignAsset {
  id: string;
  campaign_id: string;
  asset_id: string;
  asset_role: string | null;
  display_order: number | null;
  created_at: string; // ISO datetime string
  asset: Asset;
}

export interface CampaignWithAssets extends Campaign {
  campaign_assets: CampaignAsset[];
}

export interface CampaignCreate {
  campaign_name: string;
  target_audience?: string;
  campaign_goal?: string;
  additional_notes?: string;
  asset_ids: string[];
}

export interface CampaignUpdate {
  campaign_name?: string;
  target_audience?: string;
  campaign_goal?: string;
  additional_notes?: string;
}

export interface ProofGenerationResponse {
  mjml: string;
  html: string;
  generation_time: number; // seconds
}

export interface RejectionRequest {
  rejection_reason: string;
}

export interface SuccessMessage {
  message: string;
}

