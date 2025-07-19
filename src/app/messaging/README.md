# Messaging Component

A comprehensive real-time messaging system for HireMyCar.com.ng that enables communication between renters and hosts regarding bookings and vehicles.

## Features

### 🎯 Core Functionality
- **Real-time messaging** between renters and hosts
- **Conversation management** with search and filtering
- **Multiple message types**: text, images, and system notifications
- **Message status tracking**: sent, delivered, read
- **Typing indicators** with animated dots
- **Online status** indicators for users

### 📱 Responsive Design
- **Desktop**: Two-panel layout (conversation list + chat)
- **Mobile**: Single-panel view with navigation
- **Touch-optimized** input and interactions
- **Adaptive layouts** for different screen sizes

### 🎨 UI/UX Features
- **Nigerian color scheme** with red primary and blue accents
- **Modern chat bubbles** with proper alignment
- **Smooth animations** and transitions
- **Loading states** and visual feedback
- **Emoji picker** for enhanced communication
- **File attachment** support for images

### 🔍 Search & Organization
- **Real-time search** by user name or car title
- **Date separators** in message history
- **Unread message badges**
- **Conversation preview** with last message
- **Message status indicators**

## Component Structure

```
messaging/
├── messaging.component.ts      # Main component logic
├── messaging.component.html    # Template with two-panel layout
├── messaging.component.scss    # Styles with Nigerian theme
└── README.md                  # This documentation
```

## Type Definitions

### User Interface
```typescript
interface User {
  id: string;
  name: string;
  avatarUrl: string;
  isOnline: boolean;
}
```

### Message Interface
```typescript
interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'system';
  status?: 'sent' | 'delivered' | 'read';
  imageUrl?: string;
}
```

### Conversation Interface
```typescript
interface Conversation {
  id: string;
  user: User;
  carTitle?: string;
  lastMessage: Message;
  unreadCount: number;
  messages: Message[];
}
```

## Usage

### Basic Implementation
```typescript
// In your component
import { MessagingComponent } from './messaging/messaging.component';

// Add to routes
{ path: 'messaging', component: MessagingComponent }
```

### Navigation
```typescript
// Navigate to messaging
this.router.navigate(['/messaging']);
```

## Features in Detail

### 1. Conversation List (Left Panel)
- **User avatars** with online status indicators
- **Conversation preview** showing last message
- **Car title** display for booking-related chats
- **Timestamp** formatting (Today, Yesterday, etc.)
- **Unread count** badges
- **Message status** indicators for sent messages
- **Search functionality** with real-time filtering

### 2. Chat Interface (Right Panel)
- **Chat header** with user info and car details
- **Message bubbles** with different styles for:
  - Text messages (left/right alignment)
  - Image messages (clickable thumbnails)
  - System messages (booking confirmations)
- **Date separators** for message organization
- **Typing indicators** with animated dots
- **Message status** tracking (✓, ✓✓, colored ✓✓)

### 3. Message Input
- **Multi-line textarea** with auto-resize
- **Emoji picker** with common emojis
- **File attachment** for images
- **Send button** with loading states
- **Keyboard shortcuts** (Enter to send, Shift+Enter for new line)

### 4. Real-time Features
- **Typing simulation** with random responses
- **Online status** updates
- **Message delivery** status progression
- **Auto-scroll** to latest messages
- **Real-time search** filtering

## Styling

### Color Scheme (Nigerian Theme)
- **Primary Red**: `#dc2626` - Main brand color
- **Light Red**: `#fef2f2` - Background accents
- **Accent Blue**: `#2563eb` - Interactive elements
- **Success Green**: `#16a34a` - Online status
- **Warning Yellow**: `#eab308` - Typing indicators

### Responsive Breakpoints
- **Desktop**: `> 768px` - Two-panel layout
- **Mobile**: `≤ 768px` - Single-panel with navigation
- **Small Mobile**: `≤ 480px` - Optimized touch interface

## Mock Data

The component includes realistic mock data with:
- **5 sample conversations** with different users
- **Mixed message types**: text, images, system notifications
- **Realistic timestamps**: Today, Yesterday, 2 days ago
- **Online status** simulation
- **Typing indicators** for active conversations

## Performance Optimizations

- **TrackBy functions** for ngFor loops
- **OnPush change detection** strategy
- **Lazy loading** of images
- **Efficient scrolling** with ViewChild
- **Memory management** with proper cleanup

## Browser Support

- **Modern browsers** with ES6+ support
- **Mobile browsers** with touch events
- **Progressive enhancement** for older browsers

## Accessibility

- **Keyboard navigation** support
- **Screen reader** friendly markup
- **Focus management** for interactive elements
- **ARIA labels** and descriptions
- **High contrast** color options

## Future Enhancements

- **WebSocket integration** for real-time messaging
- **Push notifications** for new messages
- **Message encryption** for security
- **Voice messages** support
- **Group conversations** for multiple participants
- **Message reactions** and replies
- **File sharing** for documents
- **Message search** within conversations

## Troubleshooting

### Common Issues

1. **Messages not sending**
   - Check console for errors
   - Verify input validation
   - Ensure proper event handling

2. **Styling issues on mobile**
   - Check viewport meta tag
   - Verify CSS media queries
   - Test touch interactions

3. **Performance problems**
   - Monitor memory usage
   - Check for memory leaks
   - Optimize change detection

### Debug Mode

Enable debug logging by adding to component:
```typescript
// Add to constructor or ngOnInit
console.log('Messaging component initialized');
```

## Contributing

When contributing to this component:

1. **Follow Angular style guide**
2. **Add TypeScript types** for all new features
3. **Include responsive design** considerations
4. **Test on multiple devices** and browsers
5. **Update documentation** for new features

## License

This component is part of the HireMyCar.com.ng project and follows the project's licensing terms. 