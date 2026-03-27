import { createContext, useContext, useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null); // Create a ref to store the socket instance

  // const [token, setToken] = useState(null);

  useEffect(() => {
    const currentToken = localStorage.getItem("token");
    // Only connect if we have a token AND haven't connected yet.
    if (currentToken && !socketRef.current) {
      const newSocket = io(import.meta.env.VITE_API_URL, {
        auth: {
          token: currentToken, // Use the locally retrieved token directly
        },
        transports: ["websocket"],
        withCredentials: true,
      });

      // ... (Your event listeners and cleanup logic remain the same)

      socketRef.current = newSocket;
      setSocket(newSocket); // Keep the state update for consumers

      // ... Cleanup function
      return () => {
        if (socketRef.current) {
          socketRef.current.close();
          socketRef.current = null;
        }
      };
    }
    // The dependency array is empty now, as we only want to run this once on mount.
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
