# Real-Time Chat Application

## Overview
This project is a full-stack real-time chat application that enables users to send messages and images instantly while displaying online user statuses. The application includes user authentication, profile management, and theme customization. Built with modern technologies, it ensures a seamless and responsive user experience across devices.

## Features
- **Real-time chat** with online user status updates
- **Message delivery tracking** to confirm sent and received messages
- **Image sharing** via Cloudinary for efficient media uploads
- **User authentication** using JSON Web Tokens (JWT)
- **Profile management** with avatar uploads and theme selection
- **Optimized performance** by filtering messages and handling loading states
- **Secure backend** using environment variables and password hashing
- **Mobile-friendly UI** with responsive design
- **Dark and light theme support** stored in local storage

## Technologies Used
### Frontend:
- React
- Tailwind CSS & Daisy UI
- React Router for navigation
- State management for efficient updates

### Backend:
- Node.js
- Express.js
- MongoDB with Mongoose
- Socket.io for real-time messaging
- JWT authentication
- Cloudinary for image uploads

## Installation
### Prerequisites
Ensure you have the following installed on your system:
- Node.js
- MongoDB (or use a cloud service like MongoDB Atlas)

### Setup Instructions
1. **Clone the repository:**
   ```sh
   git clone https://github.com/your-username/real-time-chat.git
   cd real-time-chat
   ```
2. **Install dependencies:**
   ```sh
   npm install  # Install backend dependencies
   cd client
   npm install  # Install frontend dependencies
   ```
3. **Set up environment variables:**
   Create a `.env` file in the root directory and add:
   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```
4. **Start the backend server:**
   ```sh
   npm run server
   ```
5. **Start the frontend:**
   ```sh
   cd client
   npm start
   ```
6. Open `http://localhost:3000` in your browser.

## Project Structure
```
real-time-chat/
│── client/  # React frontend
│── server/  # Node.js and Express backend
│── models/  # Mongoose schemas
│── routes/  # API endpoints
│── config/  # Environment and database configurations
│── socket/  # Real-time WebSocket events
│── public/  # Static assets
```

## Key Functionalities
### Real-Time Chat
- Implemented with **Socket.io** to enable instant messaging.
- Online/offline status updates for users.
- Messages are stored in MongoDB for persistence.

### Authentication & Security
- **JWT-based authentication** to secure API endpoints.
- **Password hashing** using bcrypt before storing in the database.
- **HTTP-only cookies** for session management.

### Image Uploads
- **Cloudinary integration** for storing profile and chat images securely.
- Users can upload images along with their messages.

### Performance Optimizations
- **Filtered message rendering** based on selected users.
- **Lazy loading** to improve performance.
- **Loading states** implemented for login, signup, and data fetching.

### Theming & UI Enhancements
- **Daisy UI & Tailwind CSS** for rapid UI development.
- **Theme manager** to switch between light and dark modes.
- **Persistent theme selection** using local storage.

## Deployment
### Steps to deploy on a cloud platform:
1. **Setup a cloud MongoDB database** (MongoDB Atlas recommended).
2. **Deploy backend on a hosting service** like Render, Vercel, or Heroku.
3. **Deploy frontend on Netlify or Vercel.**
4. **Update environment variables** on the server.
5. **Run build and start scripts:**
   ```sh
   npm run build
   npm start
   ```

## Troubleshooting & Debugging
### Common Issues & Fixes
1. **CORS errors:** Ensure backend allows frontend requests.
2. **Socket connection issues:** Check WebSocket server logs.
3. **JWT authentication errors:** Verify secret keys and token expiration.
4. **Image upload issues:** Confirm Cloudinary API keys are correct.

## Contributing
Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create a new branch (`feature/your-feature-name`).
3. Commit your changes and push to GitHub.
4. Open a pull request.

## License
This project is licensed under the MIT License.

## Acknowledgments
- Inspired by various real-time chat implementations.
- Uses open-source tools and libraries for optimal performance.


