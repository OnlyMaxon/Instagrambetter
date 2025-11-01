# JalilGram

A full-featured Instagram clone built with React Native and Expo Go. JalilGram replicates Instagram's core functionality with a modern UI and classic UX, working entirely locally without a database.

## Features

### 🎯 Core Features
- **Authentication**: Login and signup with local storage
- **Feed**: Scrollable feed with posts from all users
- **Posts**: Create posts with photos from camera or gallery
- **Likes & Comments**: Like posts and comment on them
- **User Profiles**: View user profiles with post grids
- **Search**: Search for users by username or full name
- **Follow/Unfollow**: Follow and unfollow users
- **Notifications**: Get notified for likes, comments, and follows
- **Stories**: (UI ready for implementation)
- **Direct Messages**: (UI ready for implementation)

### 💾 Local Storage
All data is stored locally using AsyncStorage:
- User accounts
- Posts
- Comments
- Likes
- Followers/Following
- Notifications
- Messages

### 🎨 UI/UX
- Modern, clean Instagram-inspired design
- Classic Instagram UX patterns
- Smooth animations and transitions
- Responsive layout for all devices
- Bottom tab navigation

## Getting Started

### Prerequisites
- Node.js (v14 or newer)
- npm or yarn
- Expo Go app on your mobile device (iOS or Android)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/OnlyMaxon/JalilGram.git
cd JalilGram
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Scan the QR code with:
   - **iOS**: Camera app
   - **Android**: Expo Go app

## Demo Accounts

The app comes with pre-configured demo accounts:

| Username | Password | Description |
|----------|----------|-------------|
| jalil_user | demo123 | Main demo user |
| demo_user | demo123 | Secondary user with posts |
| test_user | demo123 | Test user |

You can also create new accounts through the signup screen.

## Project Structure

```
JalilGram/
├── src/
│   ├── components/         # Reusable UI components
│   ├── navigation/         # Navigation configuration
│   │   ├── AuthNavigator.tsx
│   │   └── MainNavigator.tsx
│   ├── screens/           # Screen components
│   │   ├── LoginScreen.tsx
│   │   ├── SignupScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── SearchScreen.tsx
│   │   ├── AddPostScreen.tsx
│   │   ├── NotificationsScreen.tsx
│   │   └── ProfileScreen.tsx
│   ├── services/          # Business logic and data management
│   │   └── dataService.ts
│   ├── types/             # TypeScript type definitions
│   │   └── index.ts
│   └── utils/             # Utility functions
├── assets/                # Images, fonts, etc.
├── App.tsx               # Root component
├── app.json              # Expo configuration
└── package.json          # Dependencies
```

## Tech Stack

- **React Native**: Mobile app framework
- **Expo**: Development platform
- **TypeScript**: Type-safe JavaScript
- **React Navigation**: Navigation library
  - Bottom Tabs Navigator
  - Stack Navigator
- **AsyncStorage**: Local data persistence
- **Expo Image Picker**: Camera and gallery access
- **Expo Camera**: Camera functionality
- **Expo Linear Gradient**: Gradient effects
- **Expo Vector Icons**: Icon library

## Features in Detail

### Authentication
- Login with username/password
- Signup with validation
- Auto-login after signup
- Persistent sessions

### Home Feed
- Scrollable feed of all posts
- Like/unlike posts
- Comment on posts
- View comments modal
- Pull to refresh
- Real-time updates

### Post Creation
- Take photos with camera
- Select from gallery
- Add captions
- Image preview before posting
- Progress indication

### User Profiles
- Profile picture
- Stats (posts, followers, following)
- Bio
- Post grid layout
- Edit profile button

### Search
- Search users by username or name
- Follow/unfollow from search
- Real-time search results

### Notifications
- Like notifications
- Comment notifications
- Follow notifications
- Unread indicator
- Mark as read

## Development

### Running on Different Platforms

```bash
# iOS Simulator (macOS only)
npm run ios

# Android Emulator
npm run android

# Web Browser
npm run web

# Expo Go (All Devices)
npm start
```

### Data Reset

To reset all app data, clear the app data from your device settings or use:

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';
await AsyncStorage.clear();
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Acknowledgments

- Instagram for the UX inspiration
- Expo team for the amazing development platform
- React Native community

## Future Enhancements

- [ ] Stories with 24-hour expiration
- [ ] Direct messaging
- [ ] Video posts
- [ ] Instagram Reels equivalent
- [ ] Story reactions
- [ ] Post sharing
- [ ] Hashtags
- [ ] Location tagging
- [ ] Multiple image posts
- [ ] Photo filters
- [ ] Dark mode
- [ ] Push notifications

## Support

For issues and feature requests, please use the GitHub issue tracker.

---

**Made with ❤️ using React Native and Expo**
