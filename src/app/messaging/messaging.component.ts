import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

// Type Definitions
interface User {
  id: string;
  name: string;
  avatarUrl: string;
  isOnline: boolean;
  email?: string;
  userType?: 'renter' | 'owner' | 'admin';
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'system' | 'booking_request' | 'booking_confirmed' | 'booking_cancelled';
  status?: 'sent' | 'delivered' | 'read' | 'sending' | 'failed';
  imageUrl?: string;
  metadata?: {
    carId?: string;
    bookingId?: string;
    amount?: number;
    duration?: string | number;
    audioUrl?: string;
    latitude?: number;
    longitude?: number;
    locationUrl?: string;
  };
}

interface Conversation {
  id: string;
  user: User;
  carTitle?: string;
  carId?: string;
  lastMessage: Message;
  unreadCount: number;
  messages: Message[];
  isArchived?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface ChatState {
  activeConversationId: string;
  isTyping: boolean;
  searchQuery: string;
}

@Component({
  selector: 'app-messaging',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './messaging.component.html',
  styleUrls: ['./messaging.component.scss']
})
export class MessagingComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messageContainer') messageContainer!: ElementRef;
  @ViewChild('messageInput') messageInput!: ElementRef;

  // RxJS cleanup
  private destroy$ = new Subject<void>();
  private searchSubject$ = new Subject<string>();

  // Authentication state (simplified for demo)
  currentUser: any = null;

  // Mock Users (will be replaced with real data)
  private users: User[] = [
    {
      id: '1',
      name: 'Adebayo Johnson',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      isOnline: true
    },
    {
      id: '2',
      name: 'Sarah Okonkwo',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      isOnline: false
    },
    {
      id: '3',
      name: 'Michael Adebayo',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      isOnline: true
    },
    {
      id: '4',
      name: 'David Okechukwu',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      isOnline: false
    },
    {
      id: '5',
      name: 'Grace Eze',
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      isOnline: true
    }
  ];

  // Mock Conversations
  conversations: Conversation[] = [
    {
      id: '1',
      user: this.users[0],
      carTitle: 'Toyota Camry 2023',
      lastMessage: {
        id: 'msg1',
        senderId: '1',
        content: "Perfect! I'll be there at 2 PM. Thanks!",
        timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
        type: 'text',
        status: 'read'
      },
      unreadCount: 0,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      updatedAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      messages: [
        {
          id: 'msg1',
          senderId: '1',
          content: "Hi! I'm interested in your Toyota Camry. Is it available for tomorrow?",
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          type: 'text',
          status: 'read'
        },
        {
          id: 'msg2',
          senderId: 'me',
          content: "Yes, it's available! What time would you like to pick it up?",
          timestamp: new Date(Date.now() - 25 * 60 * 1000),
          type: 'text',
          status: 'read'
        },
        {
          id: 'msg3',
          senderId: '1',
          content: 'Around 2 PM would work for me. Can you send me the exact location?',
          timestamp: new Date(Date.now() - 20 * 60 * 1000),
          type: 'text',
          status: 'read'
        },
        {
          id: 'msg4',
          senderId: 'me',
          content: 'Sure! Here\'s the pickup location: Victoria Island, Lagos.',
          timestamp: new Date(Date.now() - 15 * 60 * 1000),
          type: 'text',
          status: 'read'
        },
        {
          id: 'msg5',
          senderId: '1',
          content: 'Perfect! I\'ll be there at 2 PM. Thanks!',
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          type: 'text',
          status: 'read'
        }
      ]
    },
    {
      id: '2',
      user: this.users[1],
      carTitle: 'Honda Civic 2022',
      lastMessage: {
        id: 'msg6',
        senderId: 'me',
        content: 'The car is ready for pickup!',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        type: 'text',
        status: 'delivered'
      },
      unreadCount: 0,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      messages: [
        {
          id: 'msg6',
          senderId: 'me',
          content: 'The car is ready for pickup!',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          type: 'text',
          status: 'delivered'
        }
      ]
    },
    {
      id: '3',
      user: this.users[2],
      carTitle: 'BMW 3 Series 2022',
      lastMessage: {
        id: 'msg7',
        senderId: '3',
        content: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=400&h=300&fit=crop',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        type: 'image',
        status: 'read',
        imageUrl: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=400&h=300&fit=crop'
      },
      unreadCount: 0,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      messages: [
        {
          id: 'msg7',
          senderId: '3',
          content: 'Here\'s a photo of the car',
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
          type: 'image',
          status: 'read',
          imageUrl: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=400&h=300&fit=crop'
        }
      ]
    },
    {
      id: '4',
      user: this.users[3],
      carTitle: 'Lexus RX 2023',
      lastMessage: {
        id: 'msg8',
        senderId: 'system',
        content: 'Booking confirmed for Lexus RX 2023',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        type: 'system',
        status: 'read'
      },
      unreadCount: 0,
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
      updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      messages: [
        {
          id: 'msg8',
          senderId: 'system',
          content: 'Booking confirmed for Lexus RX 2023',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
          type: 'system',
          status: 'read'
        }
      ]
    },
    {
      id: '5',
      user: this.users[4],
      carTitle: 'Toyota Corolla 2021',
      lastMessage: {
        id: 'msg9',
        senderId: '5',
        content: 'Is the car still available for this weekend?',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        type: 'text',
        status: 'read'
      },
      unreadCount: 2,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      messages: [
        {
          id: 'msg9',
          senderId: '5',
          content: 'Is the car still available for this weekend?',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          type: 'text',
          status: 'read'
        }
      ]
    }
  ];

  // Chat State
  chatState: ChatState = {
    activeConversationId: '1',
    isTyping: false,
    searchQuery: ''
  };

  // Message Input
  newMessage = '';
  isSending = false;
  showEmojiPicker = false;
  selectedFile: File | null = null;

  // Typing Simulation
  private typingTimeout: any;
  private typingInterval: any;

  // Real-time Updates
  private updateInterval: any;

  // Current User (for demo purposes)
  currentUserId = 'me';

  // Enhanced features
  showSearchResults = false;
  searchResults: Conversation[] = [];
  isSearching = false;
  showArchivedConversations = false;
  messageReactions: { [messageId: string]: string[] } = {};
  quickReplies = [
    'Yes, it\'s available!',
    'What time works for you?',
    'I\'ll send you the location',
    'Thanks for your interest!',
    'Let me check and get back to you'
  ];

  // Modern messaging features
  isLoadingMessages = false;
  showReactionPickerForMessage: string | null = null;
  isVoiceMode = false;
  isRecording = false;
  recordingDuration = 0;
  private recordingInterval: any;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];

  constructor() {
    // Simplified constructor for demo
  }

  ngOnInit(): void {
    console.log('Messaging component initialized');
    this.initializeSearch();
    this.startTypingSimulation();
    this.startRealTimeUpdates();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
    if (this.typingInterval) {
      clearInterval(this.typingInterval);
    }
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  // Get active conversation
  get activeConversation(): Conversation | undefined {
    return this.conversations.find(conv => conv.id === this.chatState.activeConversationId);
  }

  // Get filtered conversations
  get filteredConversations(): Conversation[] {
    if (!this.chatState.searchQuery) {
      return this.conversations;
    }
    
    const query = this.chatState.searchQuery.toLowerCase();
    return this.conversations.filter(conv => 
      conv.user.name.toLowerCase().includes(query) ||
      (conv.carTitle && conv.carTitle.toLowerCase().includes(query))
    );
  }

  // Switch conversation
  selectConversation(conversationId: string): void {
    this.chatState.activeConversationId = conversationId;
    this.chatState.isTyping = false;
    
    // Mark messages as read
    const conversation = this.conversations.find(conv => conv.id === conversationId);
    if (conversation) {
      conversation.unreadCount = 0;
      conversation.messages.forEach(msg => {
        if (msg.senderId !== this.currentUserId) {
          msg.status = 'read';
        }
      });
    }
  }

  // Send message
  sendMessage(): void {
    if (!this.newMessage.trim() && !this.selectedFile) return;

    this.isSending = true;
    const activeConv = this.activeConversation;
    
    if (!activeConv) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: this.currentUserId,
      content: this.newMessage.trim(),
      timestamp: new Date(),
      type: this.selectedFile ? 'image' : 'text',
      status: 'sent',
      imageUrl: this.selectedFile ? URL.createObjectURL(this.selectedFile) : undefined
    };

    // Add message to conversation
    activeConv.messages.push(message);
    activeConv.lastMessage = message;
    activeConv.unreadCount = 0;

    // Clear input
    this.newMessage = '';
    this.selectedFile = null;

    console.log('Message sent:', message);

    // Simulate sending delay
    setTimeout(() => {
      message.status = 'delivered';
      this.isSending = false;
    }, 1000);

    // Simulate read status after 2 seconds
    setTimeout(() => {
      message.status = 'read';
    }, 2000);

    // Simulate typing response
    this.simulateTypingResponse();
  }

  // Handle file selection
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      this.selectedFile = file;
    }
  }

  // Remove selected file
  removeSelectedFile(): void {
    this.selectedFile = null;
  }

  // Toggle emoji picker
  toggleEmojiPicker(): void {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  // Add emoji to message
  addEmoji(emoji: string): void {
    this.newMessage += emoji;
    this.showEmojiPicker = false;
  }

  // Scroll to bottom of messages
  private scrollToBottom(): void {
    if (this.messageContainer) {
      const element = this.messageContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }

  // Simulate typing response
  private simulateTypingResponse(): void {
    const activeConv = this.activeConversation;
    if (!activeConv) return;

    // Simulate typing indicator
    setTimeout(() => {
      this.chatState.isTyping = true;
      
      setTimeout(() => {
        this.chatState.isTyping = false;
        
        // Add a response message
        const responseMessage: Message = {
          id: (Date.now() + 1).toString(),
          senderId: activeConv.user.id,
          content: this.getRandomResponse(),
          timestamp: new Date(),
          type: 'text',
          status: 'sent'
        };

        activeConv.messages.push(responseMessage);
        activeConv.lastMessage = responseMessage;

        // Update status after delay
        setTimeout(() => {
          responseMessage.status = 'delivered';
        }, 1000);

        setTimeout(() => {
          responseMessage.status = 'read';
        }, 2000);
      }, 2000);
    }, 1000);
  }

  // Get random response
  private getRandomResponse(): string {
    const responses = [
      'Thanks for the message!',
      'I\'ll get back to you soon.',
      'Perfect! That works for me.',
      'Can you send me more details?',
      'I\'m available at that time.',
      'Let me check and confirm.',
      'Great! Looking forward to it.',
      'I\'ll confirm the booking.'
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Start typing simulation
  private startTypingSimulation(): void {
    this.typingInterval = setInterval(() => {
      const randomConv = this.conversations[Math.floor(Math.random() * this.conversations.length)];
      if (randomConv && randomConv.id !== this.chatState.activeConversationId) {
        randomConv.user.isOnline = Math.random() > 0.5;
      }
    }, 30000); // Every 30 seconds
  }

  // Start real-time updates
  private startRealTimeUpdates(): void {
    this.updateInterval = setInterval(() => {
      // Simulate online status changes
      this.conversations.forEach(conv => {
        if (Math.random() > 0.8) {
          conv.user.isOnline = !conv.user.isOnline;
        }
      });
    }, 60000); // Every minute
  }

  // Format timestamp
  formatTimestamp(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleDateString('en-NG', {
      month: 'short',
      day: 'numeric'
    });
  }

  // Format message time
  formatMessageTime(date: Date): string {
    return date.toLocaleTimeString('en-NG', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Check if message is from current user
  isOwnMessage(message: Message): boolean {
    return message.senderId === this.currentUserId;
  }


  // Check if should show date separator
  shouldShowDateSeparator(message: Message, index: number): boolean {
    if (index === 0) return true;
    
    const activeConv = this.activeConversation;
    if (!activeConv) return false;

    const currentDate = new Date(message.timestamp).toDateString();
    const previousDate = new Date(activeConv.messages[index - 1].timestamp).toDateString();
    
    return currentDate !== previousDate;
  }

  // Get date separator text
  getDateSeparatorText(date: Date): string {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const messageDate = new Date(date);
    
    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString('en-NG', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      });
    }
  }

  // Track by functions for performance
  trackByConversationId(index: number, conversation: Conversation): string {
    return conversation.id;
  }

  trackByMessageId(index: number, message: Message): string {
    return message.id;
  }

  // Image modal methods
  openImageModal(imageUrl: string | undefined): void {
    if (imageUrl) {
      // For now, just open in new tab
      window.open(imageUrl, '_blank');
    }
  }

  closeImageModal(): void {
    // Modal close logic would go here
    console.log('Closing image modal');
  }

  // Handle keyboard events
  onKeyDown(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    if (keyboardEvent.key === 'Enter' && !keyboardEvent.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  // Auto-resize textarea
  autoResizeTextarea(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  }

  // Enhanced Methods (simplified for demo)
  private initializeAuth(): void {
    // Simplified for demo - no authentication required
    this.currentUserId = 'me';
    this.loadConversations();
  }

  private initializeSearch(): void {
    this.searchSubject$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(query => {
      this.performSearch(query);
    });
  }

  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.chatState.searchQuery = target.value;
    this.searchSubject$.next(target.value);
  }

  private performSearch(query: string): void {
    if (!query.trim()) {
      this.showSearchResults = false;
      this.searchResults = [];
      return;
    }

    this.isSearching = true;
    this.showSearchResults = true;

    // Simulate search delay
    setTimeout(() => {
      this.searchResults = this.conversations.filter(conv => 
        conv.user.name.toLowerCase().includes(query.toLowerCase()) ||
        (conv.carTitle && conv.carTitle.toLowerCase().includes(query.toLowerCase())) ||
        conv.messages.some(msg => msg.content.toLowerCase().includes(query.toLowerCase()))
      );
      this.isSearching = false;
    }, 300);
  }

  private async loadConversations(): Promise<void> {
    try {
      // In a real implementation, this would fetch from Supabase
      // For now, we'll use the mock data
      console.log('Loading conversations for user:', this.currentUserId);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  }

  // Quick Reply Methods
  sendQuickReply(reply: string): void {
    this.newMessage = reply;
    this.sendMessage();
  }

  // Message Reactions
  addReaction(messageId: string, reaction: string): void {
    if (!this.messageReactions[messageId]) {
      this.messageReactions[messageId] = [];
    }
    this.messageReactions[messageId].push(reaction);
  }

  removeReaction(messageId: string, reaction: string): void {
    if (this.messageReactions[messageId]) {
      const index = this.messageReactions[messageId].indexOf(reaction);
      if (index > -1) {
        this.messageReactions[messageId].splice(index, 1);
      }
    }
  }

  getMessageReactions(messageId: string): string[] {
    return this.messageReactions[messageId] || [];
  }

  // Conversation Management
  archiveConversation(conversationId: string): void {
    const conversation = this.conversations.find(conv => conv.id === conversationId);
    if (conversation) {
      conversation.isArchived = true;
      console.log('Conversation archived:', conversationId);
    }
  }

  deleteConversation(conversationId: string): void {
    const index = this.conversations.findIndex(conv => conv.id === conversationId);
    if (index > -1) {
      this.conversations.splice(index, 1);
      if (this.chatState.activeConversationId === conversationId) {
        this.chatState.activeConversationId = '';
      }
      console.log('Conversation deleted:', conversationId);
    }
  }

  toggleArchivedConversations(): void {
    this.showArchivedConversations = !this.showArchivedConversations;
  }

  // Enhanced message sending with metadata
  sendBookingRequest(carId: string, amount: number, duration: string): void {
    const activeConv = this.activeConversation;
    if (!activeConv) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: this.currentUserId,
      content: `I'd like to book this car for ${duration} at ₦${amount.toLocaleString()}`,
      timestamp: new Date(),
      type: 'booking_request',
      status: 'sent',
      metadata: {
        carId,
        amount,
        duration
      }
    };

    activeConv.messages.push(message);
    activeConv.lastMessage = message;
    this.newMessage = '';

    console.log('Booking request sent:', message);
  }

  // Message forwarding
  forwardMessage(messageId: string, targetConversationId: string): void {
    const activeConv = this.activeConversation;
    if (!activeConv) return;

    const message = activeConv.messages.find(msg => msg.id === messageId);
    if (!message) return;

    const targetConv = this.conversations.find(conv => conv.id === targetConversationId);
    if (!targetConv) return;

    const forwardedMessage: Message = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date(),
      status: 'sent'
    };

    targetConv.messages.push(forwardedMessage);
    targetConv.lastMessage = forwardedMessage;

    console.log('Message forwarded:', forwardedMessage);
  }

  // Enhanced message status tracking
  markMessageAsRead(messageId: string): void {
    const activeConv = this.activeConversation;
    if (!activeConv) return;

    const message = activeConv.messages.find(msg => msg.id === messageId);
    if (message && message.senderId !== this.currentUserId) {
      message.status = 'read';
    }
  }

  // Get conversation statistics
  getConversationStats(): { total: number, unread: number, archived: number } {
    return {
      total: this.conversations.length,
      unread: this.conversations.reduce((sum, conv) => sum + conv.unreadCount, 0),
      archived: this.conversations.filter(conv => conv.isArchived).length
    };
  }

  // Modern messaging features
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  onInputFocus(): void {
    // Add focus effects or analytics
    console.log('Input focused');
  }

  onInputBlur(): void {
    // Add blur effects or analytics
    console.log('Input blurred');
  }

  showReactionPicker(messageId: string): void {
    this.showReactionPickerForMessage = messageId;
  }

  retryMessage(messageId: string): void {
    const activeConv = this.activeConversation;
    if (!activeConv) return;

    const message = activeConv.messages.find(msg => msg.id === messageId);
    if (message) {
      message.status = 'sending';
      // Simulate retry
      setTimeout(() => {
        message.status = 'delivered';
        setTimeout(() => {
          message.status = 'read';
        }, 1000);
      }, 1000);
    }
  }

  startVoiceRecording(): void {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.log('Voice recording not supported');
      return;
    }

    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        this.mediaRecorder = new MediaRecorder(stream);
        this.recordedChunks = [];

        this.mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            this.recordedChunks.push(event.data);
          }
        };

        this.mediaRecorder.start();
        this.isRecording = true;
        this.recordingDuration = 0;

        this.recordingInterval = setInterval(() => {
          this.recordingDuration++;
        }, 1000);

        console.log('Voice recording started');
      })
      .catch(error => {
        console.error('Error accessing microphone:', error);
      });
  }

  cancelRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
      this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
    
    this.isRecording = false;
    this.recordingDuration = 0;
    this.recordedChunks = [];
    
    if (this.recordingInterval) {
      clearInterval(this.recordingInterval);
    }
    
    console.log('Voice recording cancelled');
  }

  sendVoiceMessage(): void {
    if (this.mediaRecorder && this.recordedChunks.length > 0) {
      const blob = new Blob(this.recordedChunks, { type: 'audio/webm' });
      const audioUrl = URL.createObjectURL(blob);
      
      // Create voice message
      const activeConv = this.activeConversation;
      if (activeConv) {
        const message: Message = {
          id: Date.now().toString(),
          senderId: this.currentUserId,
          content: `Voice message (${this.recordingDuration}s)`,
          timestamp: new Date(),
          type: 'text', // In a real app, this would be 'voice'
          status: 'sent',
          metadata: {
            audioUrl: audioUrl,
            duration: this.recordingDuration
          }
        };

        activeConv.messages.push(message);
        activeConv.lastMessage = message;
        activeConv.unreadCount = 0;
      }
    }

    this.cancelRecording();
    console.log('Voice message sent');
  }

  shareLocation(): void {
    if (!navigator.geolocation) {
      console.log('Geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const locationUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
        
        const activeConv = this.activeConversation;
        if (activeConv) {
          const message: Message = {
            id: Date.now().toString(),
            senderId: this.currentUserId,
            content: '📍 Shared location',
            timestamp: new Date(),
            type: 'text',
            status: 'sent',
            metadata: {
              latitude,
              longitude,
              locationUrl
            }
          };

          activeConv.messages.push(message);
          activeConv.lastMessage = message;
          activeConv.unreadCount = 0;
        }
        
        console.log('Location shared:', { latitude, longitude });
      },
      (error) => {
        console.error('Error getting location:', error);
      }
    );
  }

  // Simulate loading messages
  simulateLoadingMessages(): void {
    this.isLoadingMessages = true;
    setTimeout(() => {
      this.isLoadingMessages = false;
    }, 1500);
  }

  // Enhanced message status tracking
  getStatusIcon(status: string | undefined): string {
    switch (status) {
      case 'sent': return '✓';
      case 'delivered': return '✓✓';
      case 'read': return '✓✓';
      case 'sending': return '⏳';
      case 'failed': return '❌';
      default: return '';
    }
  }

  getStatusColor(status: string | undefined): string {
    switch (status) {
      case 'sent': return 'text-gray-400';
      case 'delivered': return 'text-gray-500';
      case 'read': return 'text-blue-500';
      case 'sending': return 'text-yellow-500';
      case 'failed': return 'text-red-500';
      default: return 'text-gray-400';
    }
  }
} 