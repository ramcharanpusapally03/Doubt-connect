const Message = require('../models/Message');

const setupChatSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Join room for a specific doubt
    socket.on('joinRoom', ({ doubtId, userName }) => {
      if (!doubtId) return;
      const room = `doubt_${doubtId}`;
      socket.join(room);
      console.log(`[Socket.IO] ${userName || socket.id} joined room ${room}`);
      socket.to(room).emit('userJoined', {
        message: `${userName || 'A user'} joined the discussion`,
      });
    });

    // Leave room
    socket.on('leaveRoom', ({ doubtId }) => {
      if (!doubtId) return;
      const room = `doubt_${doubtId}`;
      socket.leave(room);
      console.log(`[Socket.IO] Socket ${socket.id} left room ${room}`);
    });

    // Handle real-time chat message
    socket.on('sendMessage', async (data) => {
      try {
        const { doubtId, senderId, receiverId, message } = data;
        if (!doubtId || !senderId || !message || !message.trim()) {
          return;
        }

        const room = `doubt_${doubtId}`;

        // Save to database
        const savedMessage = await Message.create({
          doubtId,
          senderId,
          receiverId: receiverId || senderId,
          message: message.trim(),
        });

        const populated = await Message.findById(savedMessage._id)
          .populate('senderId', 'name studentId role')
          .populate('receiverId', 'name studentId role');

        // Broadcast to all participants in this room (including sender)
        io.to(room).emit('receiveMessage', populated);
      } catch (err) {
        console.error('[Socket.IO] Error saving message:', err.message);
        socket.emit('error', { message: 'Failed to deliver message' });
      }
    });

    // Handle typing status
    socket.on('typing', ({ doubtId, userName }) => {
      if (!doubtId) return;
      socket.to(`doubt_${doubtId}`).emit('userTyping', { userName });
    });

    socket.on('stopTyping', ({ doubtId }) => {
      if (!doubtId) return;
      socket.to(`doubt_${doubtId}`).emit('userStoppedTyping');
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });
};

module.exports = setupChatSocket;
