const { Server } = require('socket.io');

let io;

const initSocket = (server, allowedOrigins) => {
  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    socket.on('join_admin', () => {
      socket.join('admin_room');
      console.log(`Socket ${socket.id} joined admin_room`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket ${socket.id} disconnected`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

const emitNewOrder = (order) => {
  if (io) {
    io.to('admin_room').emit('new_order', {
      orderId: order._id,
      customer: order.user?.name || 'Guest',
      amount: order.totalAmount,
      items: order.items?.length || 0
    });
  }
};

module.exports = { initSocket, getIO, emitNewOrder };
