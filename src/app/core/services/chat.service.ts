import { Injectable, inject, signal } from "@angular/core";
import { SupabaseService } from "./supabase.service";
import { AuthServices } from "./auth.service";
import { Message } from "../models/chat-message.model";

@Injectable({
    providedIn: "root",
})

export class ChatService {
    private supabase = inject(SupabaseService);
    private auth = inject(AuthServices);
    messages = signal<Message[]>([])

    async getMessages() { //traigo todos mis {mensajes} y los meto en la signal
        const { data, error } = await this.supabase.getClient().from('chat').select('*, user_profile!inner(*)').order('created_at', { ascending: true });
        if (error) console.log(error.message);
        if (data) { this.messages.set(data) };
    };

    async listenMessagesInRealTime() {
        this.supabase.getClient().channel('chat').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat' },
            async (payload) => {
                const msg = payload.new;             // capturo el mensaje nuevo
                const { data: profile } = await this.supabase.getClient()
                    .from('user_profile')
                    .select('*')
                    .eq('id', msg['user_id'])
                    .single();                      // busco SOLO el perfil del que escribió
                this.messages.update(m => [...m, {  // agrego UNO al array, no recargo todos
                    id: msg['id'],
                    message: msg['message'], // payload.new esta tipado en index signature [key: string]: value (la key va con corchetes)
                    user_id: msg['user_id'],
                    created_at: msg['created_at'],
                    user_profile: profile ?? undefined
                }]);
            }).subscribe();
    }

    async sendMessages(message: string) {
        const user = this.auth.currentUser();  // { id, email }
        if (!user || !message.trim()) return;

        try {   // para que el usuario se entere en caso que no se envie el mensaje
            await this.supabase.getClient().from('chat') 
            .insert({user_id: user.id, message: message.trim()});
        } catch (err) {
            console.error('Error al enviar mensaje', err);
        }
    }


}
