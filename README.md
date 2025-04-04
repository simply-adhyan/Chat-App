# Real-Time Chat Application

## Overview

This project is a full-stack real-time chat application that enables users to send messages and images instantly while displaying online user statuses. The application includes user authentication, profile management, theme customization, and a suite of enhanced features to ensure a seamless and responsive user experience across devices.

## Features

- **Real-time Chat with Online User Status Updates**: Instant messaging with visibility into users' online statuses.
- **Message Delivery Tracking**: Confirm sent and received messages with double tick indicators and real-time updates on message seen status.
- **Image Sharing via Cloudinary**: Efficient media uploads and sharing through Cloudinary integration.
- **Voice Message Sharing**: Record and send voice messages within the chat interface.
- **Location Sharing**: Share real-time location with chat participants.
- **OTP Verification**: Enhanced security with One-Time Password verification during critical operations.
- **User Authentication using JSON Web Tokens (JWT)**: Secure login and session management.
- **Profile Management**:
  - **Avatar Uploads**: Personalize profiles with custom avatars.
  - **GIF Profile Pictures**: Support for animated GIFs as profile pictures.
  - **Theme Selection**: Choose between dark and light themes, with preferences stored in local storage.
- **Password Management**:
  - **Forgot Password**: Initiate password reset process securely.
  - **Reset Password**: Update password using secure links.
- **Chat Management**:
  - **Delete Chat**: Remove individual chat messages.
  - **Delete User**: Admin functionality to remove users from the platform.
- **Optimized Performance**: Filtered message rendering, lazy loading, and efficient handling of loading states.
- **Secure Backend**: Utilizes environment variables and password hashing for enhanced security.
- **Mobile-Friendly UI**: Responsive design ensuring compatibility across various devices.
- **Word Break Handling**: Ensures proper text wrapping and display in chat messages.

## Technologies Used

**Frontend**:
- React
- Tailwind CSS & Daisy UI
- React Router for navigation
- State management for efficient updates

**Backend**:
- Node.js
- Express.js
- MongoDB with Mongoose
- Socket.io for real-time messaging
- JWT authentication
- Cloudinary for image uploads

## Installation

**Prerequisites**:
- Node.js
- MongoDB (or use a cloud service like MongoDB Atlas)

**Setup Instructions**:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/real-time-chat.git
   cd real-time-chat
   ```

2. **Install dependencies**:
   ```bash
   npm install  # Install backend dependencies
   cd client
   npm install  # Install frontend dependencies
   ```

3. **Set up environment variables**: Create a `.env` file in the root directory and add:
   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

4. **Start the backend server**:
   ```bash
   npm run server
   ```

5. **Start the frontend**:
   ```bash
   cd client
   npm start
   ```

6. **Open** `http://localhost:3000` **in your browser**.

## Project Structure

```
real-time-chat/
├── client/      # React frontend
├── server/      # Node.js and Express backend
├── models/      # Mongoose schemas
├── routes/      # API endpoints
├── config/      # Environment and database configurations
├── socket/      # Real-time WebSocket events
├── public/      # Static assets
```

## Key Functionalities

### Real-Time Chat

- Implemented with Socket.io to enable instant messaging.
- Online/offline status updates for users.
- Messages are stored in MongoDB for persistence.
- Double tick indicators for message delivery and seen status.

### Authentication & Security

- JWT-based authentication to secure API endpoints.
- Password hashing using bcrypt before storing in the database.
- HTTP-only cookies for session management.
- OTP verification for enhanced security during sensitive operations.

### Media Sharing

- Cloudinary integration for storing profile and chat images securely.
- Users can upload images along with their messages.
- Support for voice message recording and sharing.
- Real-time location sharing within chats.

### Performance Optimizations

- Filtered message rendering based on selected users.
- Lazy loading to improve performance.
- Loading states implemented for login, signup, and data fetching.

### Theming & UI Enhancements

- Daisy UI & Tailwind CSS for rapid UI development.
- Theme manager to switch between light and dark modes.
- Persistent theme selection using local storage.
- Support for GIF profile pictures.

## Deployment

**Steps to deploy on a cloud platform**:

1. **Setup a cloud MongoDB database** (MongoDB Atlas recommended).
2. **Deploy backend** on a hosting service like Render, Vercel, or Heroku.
3. **Deploy frontend** on Netlify or Vercel.
4. **Update environment variables** on the server.
5. **Run build and start scripts**:
   ```bash
   npm run build
   npm start
   ```

## Troubleshooting & Debugging

**Common Issues & Fixes**:

- **CORS errors**: Ensure backend allows frontend requests.
- **Socket connection issues**: Check WebSocket server logs.
- **JWT authentication errors**: Verify secret keys and token expiration.
- **Image upload issues**: Confirm Cloudinary API keys are correct.

## Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**.
2. **Create a new branch** (`feature/your-feature-name`).
3. **Commit your changes** and push to GitHub.
4. **Open a pull request**.

## License

This project is licensed under the MIT License.

## Acknowledgments

- Inspired by various real-time chat implementations.
- Uses open-source tools and libraries for optimal performance.
