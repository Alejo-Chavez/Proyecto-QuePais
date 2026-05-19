import { SupabaseService } from "./supabase.service";
import { Router } from "@angular/router";
import { inject, Injectable, signal } from "@angular/core";
import { UserProfile, AuthUser } from "../models/user-profile.model.ts";
    

@Injectable({ providedIn: "root" })

export class AuthServices {
    private router = inject(Router);
    private supabase = inject(SupabaseService);

    currentUser = signal<AuthUser | null >(null);
    userProfile = signal<UserProfile | null> (null);

    async register(email: string, password: string){
        return await this.supabase.getClient().auth.signUp({email,password})
    }

    async login(email: string, password: string): Promise<{ success: boolean, error?: string }> { //siempre devuelve boolean, y AVECES un error
    const {data, error} = await this.supabase.getClient().auth.signInWithPassword({email, password})
    if(error) {
        console.log("ERROR!!", error.message);
        return { success: false, error: error.message };
    }
    if(data.user && data.user.email){
        this.currentUser.set({id: data.user.id, email: data.user.email });
        const userId = data.session.user.id;
        await this.loadUserProfile(userId);
        return { success: true };
    }
    return { success: false, error: "Error inesperado" };
}

    async logout(){
        const {error} = await this.supabase.getClient().auth.signOut();

        if(error){console.log(error.message)} //si error no es nulo, imprimo el mensaje
        this.clearModels();
        this.router.navigate(['/login']);
    };

    async checkSession(){ // chequeo si es que en la bbdd hay una sesion iniciada
        const {data, error} = await this.supabase.getClient().auth.getSession();

        if (error) {
            console.log(error);
            this.clearModels();
            return;
        };
        if(data.session){ //si la hay restauro los datos de currentUser
            this.currentUser.set({id: data.session.user.id, email: data.session.user.email ?? '' })

            const userId = data.session.user.id; // restauraré los datos de userProfile, primero guardo id de currentUser
            await this.loadUserProfile(userId);   
        }
    }

    //helpers privados
    private async loadUserProfile(userId: string){
        const { data: profileData, error: profileError } = await this.supabase.getClient().from('user_profile').select('*').eq('id',userId).single();
        if(profileError)  //busco en la tabla user_profile si existe un id con ese valor
                {
                    console.log(profileError); //si no lo hay -> no existe perfil -> valores decurrentUser deben limpiarse
                    this.logout(); //logout limpia la signal manualmente
                }
            if(profileData){ //si hay ID, restaurar el model userProfile para usar sus datos en la pagina
                    this.userProfile.set(profileData);
            }
    }

    private clearModels(){ //si no hay sesion, el logout la limpia en supabase pero aca las signals quedan con el valor viejo
        this.currentUser.set(null);
        this.userProfile.set(null);
    }
}

