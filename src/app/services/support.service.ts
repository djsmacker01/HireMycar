import { Injectable } from '@angular/core';
import { Observable, from, throwError, BehaviorSubject } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';

// Interfaces
export interface SupportTicket {
    id: string;
    user_id: string;
    ticket_number: string;
    subject: string;
    message: string;
    category: 'general' | 'booking' | 'payment' | 'technical' | 'feedback' | 'other';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    assigned_to?: string;
    resolution?: string;
    created_at: string;
    updated_at: string;
    resolved_at?: string;
    user?: {
        full_name: string;
        email: string;
    };
}

export interface TicketResponse {
    id: string;
    ticket_id: string;
    responder_id: string;
    message: string;
    is_admin_response: boolean;
    created_at: string;
    responder?: {
        full_name: string;
        user_type: string;
    };
}

export interface CreateTicketData {
    subject: string;
    message: string;
    category: 'general' | 'booking' | 'payment' | 'technical' | 'feedback' | 'other';
    priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface FAQ {
    id: string;
    question: string;
    answer: string;
    category: string;
    is_active: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
}

@Injectable({
    providedIn: 'root'
})
export class SupportService {
    private ticketsSubject = new BehaviorSubject<SupportTicket[]>([]);
    public tickets$ = this.ticketsSubject.asObservable();

    constructor(
        private supabase: SupabaseService,
        private authService: AuthService
    ) { }

    // Ticket Management
    async createTicket(ticketData: CreateTicketData): Promise<{ success: boolean; ticket?: SupportTicket; error?: string }> {
        try {
            console.log('SupportService: createTicket called with:', ticketData);

            const currentUser = this.authService.currentUser();
            console.log('SupportService: current user:', currentUser);

            if (!currentUser) {
                console.log('SupportService: No authenticated user');
                return { success: false, error: 'User not authenticated' };
            }

            // Generate ticket number
            console.log('SupportService: Generating ticket number...');
            const { data: ticketNumberData, error: ticketError } = await this.supabase.client
                .rpc('generate_ticket_number');

            console.log('SupportService: Ticket number response:', { data: ticketNumberData, error: ticketError });

            if (ticketError) {
                console.error('SupportService: Error generating ticket number:', ticketError);
                return { success: false, error: 'Failed to generate ticket number' };
            }

            const ticketNumber = ticketNumberData;
            console.log('SupportService: Generated ticket number:', ticketNumber);

            const ticketPayload = {
                user_id: currentUser.id,
                ticket_number: ticketNumber,
                subject: ticketData.subject,
                message: ticketData.message,
                category: ticketData.category,
                priority: ticketData.priority,
                status: 'open' as const
            };

            console.log('SupportService: Creating ticket with payload:', ticketPayload);

            const { data, error } = await this.supabase.client
                .from('support_tickets')
                .insert([ticketPayload])
                .select(`
          *,
          user:user_profiles!support_tickets_user_id_fkey(full_name, email)
        `)
                .single();

            if (error) {
                console.error('SupportService: Error creating ticket:', error);
                return { success: false, error: error.message };
            }

            console.log('SupportService: Ticket created successfully:', data);

            // Refresh tickets list
            this.loadUserTickets();

            return { success: true, ticket: data };
        } catch (error: any) {
            console.error('SupportService: Error in createTicket:', error);
            return { success: false, error: error.message || 'An unexpected error occurred' };
        }
    }

    async getUserTickets(): Promise<Observable<SupportTicket[]>> {
        try {
            const currentUser = this.authService.currentUser();
            if (!currentUser) {
                return throwError(() => new Error('User not authenticated'));
            }

            const { data, error } = await this.supabase.client
                .from('support_tickets')
                .select(`
          *,
          user:user_profiles!support_tickets_user_id_fkey(full_name, email)
        `)
                .eq('user_id', currentUser.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching tickets:', error);
                return throwError(() => error);
            }

            this.ticketsSubject.next(data || []);
            return this.tickets$;
        } catch (error: any) {
            console.error('Error in getUserTickets:', error);
            return throwError(() => error);
        }
    }

    async loadUserTickets(): Promise<void> {
        try {
            const currentUser = this.authService.currentUser();
            if (!currentUser) return;

            const { data, error } = await this.supabase.client
                .from('support_tickets')
                .select(`
          *,
          user:user_profiles!support_tickets_user_id_fkey(full_name, email)
        `)
                .eq('user_id', currentUser.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error loading tickets:', error);
                return;
            }

            this.ticketsSubject.next(data || []);
        } catch (error) {
            console.error('Error in loadUserTickets:', error);
        }
    }

    async getTicketById(ticketId: string): Promise<SupportTicket | null> {
        try {
            const { data, error } = await this.supabase.client
                .from('support_tickets')
                .select(`
          *,
          user:user_profiles!support_tickets_user_id_fkey(full_name, email)
        `)
                .eq('id', ticketId)
                .single();

            if (error) {
                console.error('Error fetching ticket:', error);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Error in getTicketById:', error);
            return null;
        }
    }

    async updateTicketStatus(ticketId: string, status: 'open' | 'in_progress' | 'resolved' | 'closed'): Promise<boolean> {
        try {
            const updateData: any = {
                status,
                updated_at: new Date().toISOString()
            };

            if (status === 'resolved' || status === 'closed') {
                updateData.resolved_at = new Date().toISOString();
            }

            const { error } = await this.supabase.client
                .from('support_tickets')
                .update(updateData)
                .eq('id', ticketId);

            if (error) {
                console.error('Error updating ticket status:', error);
                return false;
            }

            // Refresh tickets list
            this.loadUserTickets();
            return true;
        } catch (error) {
            console.error('Error in updateTicketStatus:', error);
            return false;
        }
    }

    // Ticket Responses
    async addTicketResponse(ticketId: string, message: string): Promise<boolean> {
        try {
            const currentUser = this.authService.currentUser();
            if (!currentUser) {
                console.error('User not authenticated');
                return false;
            }

            const isAdmin = this.authService.isAdmin();

            const responseData = {
                ticket_id: ticketId,
                responder_id: currentUser.id,
                message,
                is_admin_response: isAdmin
            };

            const { error } = await this.supabase.client
                .from('support_ticket_responses')
                .insert([responseData]);

            if (error) {
                console.error('Error adding ticket response:', error);
                return false;
            }

            // Update ticket status if admin responds
            if (isAdmin) {
                await this.updateTicketStatus(ticketId, 'in_progress');
            }

            return true;
        } catch (error) {
            console.error('Error in addTicketResponse:', error);
            return false;
        }
    }

    async getTicketResponses(ticketId: string): Promise<TicketResponse[]> {
        try {
            const { data, error } = await this.supabase.client
                .from('support_ticket_responses')
                .select(`
          *,
          responder:user_profiles!support_ticket_responses_responder_id_fkey(full_name, user_type)
        `)
                .eq('ticket_id', ticketId)
                .order('created_at', { ascending: true });

            if (error) {
                console.error('Error fetching ticket responses:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('Error in getTicketResponses:', error);
            return [];
        }
    }

    // FAQ Management
    async getFAQs(category?: string): Promise<FAQ[]> {
        try {
            let query = this.supabase.client
                .from('faqs')
                .select('*')
                .eq('is_active', true)
                .order('sort_order', { ascending: true })
                .order('created_at', { ascending: false });

            if (category && category !== 'all') {
                query = query.eq('category', category);
            }

            const { data, error } = await query;

            if (error) {
                console.error('Error fetching FAQs:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('Error in getFAQs:', error);
            return [];
        }
    }

    async searchFAQs(query: string): Promise<FAQ[]> {
        try {
            const { data, error } = await this.supabase.client
                .from('faqs')
                .select('*')
                .eq('is_active', true)
                .or(`question.ilike.%${query}%,answer.ilike.%${query}%`)
                .order('sort_order', { ascending: true });

            if (error) {
                console.error('Error searching FAQs:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('Error in searchFAQs:', error);
            return [];
        }
    }

    // Admin Functions
    async getAllTickets(): Promise<SupportTicket[]> {
        try {
            const { data, error } = await this.supabase.client
                .from('support_tickets')
                .select(`
          *,
          user:user_profiles!support_tickets_user_id_fkey(full_name, email)
        `)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching all tickets:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('Error in getAllTickets:', error);
            return [];
        }
    }

    async assignTicket(ticketId: string, adminId: string): Promise<boolean> {
        try {
            const { error } = await this.supabase.client
                .from('support_tickets')
                .update({
                    assigned_to: adminId,
                    status: 'in_progress',
                    updated_at: new Date().toISOString()
                })
                .eq('id', ticketId);

            if (error) {
                console.error('Error assigning ticket:', error);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error in assignTicket:', error);
            return false;
        }
    }

    async resolveTicket(ticketId: string, resolution: string): Promise<boolean> {
        try {
            const { error } = await this.supabase.client
                .from('support_tickets')
                .update({
                    status: 'resolved',
                    resolution,
                    resolved_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq('id', ticketId);

            if (error) {
                console.error('Error resolving ticket:', error);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error in resolveTicket:', error);
            return false;
        }
    }

    // Statistics
    async getTicketStats(): Promise<{
        total: number;
        open: number;
        in_progress: number;
        resolved: number;
        closed: number;
    }> {
        try {
            const { data, error } = await this.supabase.client
                .from('support_tickets')
                .select('status');

            if (error) {
                console.error('Error fetching ticket stats:', error);
                return { total: 0, open: 0, in_progress: 0, resolved: 0, closed: 0 };
            }

            const stats = data.reduce((acc, ticket) => {
                acc.total++;
                acc[ticket.status as keyof typeof acc]++;
                return acc;
            }, { total: 0, open: 0, in_progress: 0, resolved: 0, closed: 0 });

            return stats;
        } catch (error) {
            console.error('Error in getTicketStats:', error);
            return { total: 0, open: 0, in_progress: 0, resolved: 0, closed: 0 };
        }
    }

    // Real-time subscriptions
    subscribeToTickets(): Observable<SupportTicket[]> {
        return new Observable(subscriber => {
            const channel = this.supabase.client
                .channel('support_tickets_changes')
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'support_tickets'
                }, (payload) => {
                    console.log('Support ticket change:', payload);
                    this.loadUserTickets();
                })
                .subscribe();

            return () => {
                this.supabase.client.removeChannel(channel);
            };
        });
    }
}
