import { Injectable } from "@angular/core";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { enviroment } from "../../../enviroments/enviroments";

@Injectable({providedIn: 'root'})
export class SupabaseService {
    private client: SupabaseClient;

    constructor() {
        const supabaseURL = enviroment.supabaseURL;
        const supabaseKey = enviroment.supabaseKey;

        this.client = createClient(supabaseURL, supabaseKey);
    }

    getClient(): SupabaseClient {
        return this.client;
    }
}