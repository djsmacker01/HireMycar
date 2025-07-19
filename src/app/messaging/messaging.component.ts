import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Type Definitions
interface User {
  id: string;
  name: string;
  avatarUrl: string;
  isOnline: boolean;
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'system';
  status?: 'sent' | 'delivered' | 'read';
  imageUrl?: string;
}

interface Conversation {
  id: string;
  user: User;
  carTitle?: string;
  lastMessage: Message;
  unreadCount: number;
  messages: Message[];
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

  // Mock Users
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

  constructor() {}

  ngOnInit(): void {
    console.log('Messaging component initialized');
    this.startTypingSimulation();
    this.startRealTimeUpdates();
  }

  ngOnDestroy(): void {
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

  // Get message status icon
  getStatusIcon(status: string | undefined): string {
    switch (status) {
      case 'sent': return '✓';
      case 'delivered': return '✓✓';
      case 'read': return '✓✓';
      default: return '';
    }
  }

  // Get message status color
  getStatusColor(status: string | undefined): string {
    switch (status) {
      case 'sent': return 'text-gray-400';
      case 'delivered': return 'text-gray-500';
      case 'read': return 'text-blue-500';
      default: return 'text-gray-400';
    }
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
} 