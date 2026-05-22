import { UserProfile } from "./user-profile.model.ts";

export interface Message { //modelo de lo que recibo de la bbdd
   id: string;
   message: string;
   user_id: string;
   user_profile: UserProfile;
   created_at: string;
}