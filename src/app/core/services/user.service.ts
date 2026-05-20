import { inject, Injectable } from "@angular/core";
import { SupabaseService } from "./supabase.service";
import { UserProfile } from "../models/user-profile.model.ts";

@Injectable({ providedIn: 'root' })
export class UserService {

  private supabase = inject(SupabaseService);

  async createProfile(userId: string, profile: UserProfile) {
    return await this.supabase
      .getClient()
      .from('user_profile')
      .insert({
        id: userId,
        ...profile
      });
  }

  async getProfile(userId: string) {
    return await this.supabase
      .getClient()
      .from('user_profile')
      .select('*')
      .eq('id', userId)
      .single();
  }
}