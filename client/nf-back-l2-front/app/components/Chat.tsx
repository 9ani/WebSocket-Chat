"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";

let socket: Socket | null = null;

const Chat = () => {
  const [messages, setMessages] = useState<{ message: string; username: string }[]>([]);
  const [input, setInput] = useState<string>("");
  const [room, setRoom] = useState<string>("room-1");
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null); 
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("https://websocket-chat-back-1.onrender.com/api/auth/users");
        setUsers(response.data.filter((user: any) => user.username !== username)); 
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, [username]);

  useEffect(() => {
    if (token) {
      socket = io("https://websocket-chat-back-1.onrender.com", {
        auth: {
          token,
        },
      });

      socket.on("connect", () => {
        console.log("connected");
        socket?.emit("join-room", room);
        socket?.on("user-connected", (userId) => {
          setUsers((prevUsers) =>
            prevUsers.map((user) =>
              user._id === userId ? { ...user, online: true } : user
            )
          );
        });
        socket?.on("user-disconnected", (userId) => {
          setUsers((prevUsers) =>
            prevUsers.map((user) =>
              user._id === userId ? { ...user, online: false } : user
            )
          );
        });
      });

      socket.on("receive-message", (data) => {
        setMessages((prevMessages) => [...prevMessages, data]);
      });

      return () => {
        if (socket) {
          socket.disconnect();
        }
      };
    }
  }, [room, token]);

  const sendMessage = () => {
    if (socket && input.trim()) {
      socket.emit("send-message", input, room);
      setInput("");
    }
  };

  const handleLogin = async () => {
    try {
      const res = await axios.post("https://websocket-chat-back-1.onrender.com/api/auth/login", { email: username, password });
      setToken(res.data.accessToken);
    } catch (err: any) {
      console.error(err.message);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await axios.post("https://websocket-chat-back-1.onrender.com/api/auth/logout");
      setToken(null);
      console.log("Logout successful for user:", response.data.email); 
    } catch (err: any) {
      console.error(err.message);
    }
  };

  const handleUserClick = (user: any) => {
    setSelectedUser(user);
    router.push(`/chat/${user._id}`); 
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      {!token ? (
        <div className="space-y-4">
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="border p-2 flex-grow"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border p-2 flex-grow"
            />
          </div>
          <div className="flex space-x-2">
            <button onClick={handleLogin} className="p-2 bg-blue-600 text-white flex-grow">
              Login
            </button>
            <Link href="/register" className="p-2 bg-blue-600 text-white flex-grow text-center">
              Register
            </Link>
          </div>
        </div>
      ) : (
        <>
          <button onClick={handleLogout} className="p-2 bg-red-600 text-white mb-4">
            Logout
          </button>
          <h1 className="text-2xl mb-4">Chat Room</h1>
          <div className="border p-4 h-64 overflow-y-scroll mb-4">
            {messages.map((msg, index) => (
              <div key={index} className="mb-2">
                <strong>{msg.username}:</strong> {msg.message}
              </div>
            ))}
          </div>
          <div className="flex mb-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="border p-2 flex-grow"
            />
            <button onClick={sendMessage} className="ml-2 p-2 bg-blue-600 text-white">
              Send
            </button>
          </div>
          <div>
            <h2 className="text-xl mb-2">Users:</h2>
            <ul>
              {users.map((user) => (
                <li
                  key={user._id}
                  onClick={() => handleUserClick(user)}
                  className="cursor-pointer hover:bg-gray-200 p-2"
                >
                  {user.username} {user.online ? "(Online)" : "(Offline)"} 
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default Chat;
