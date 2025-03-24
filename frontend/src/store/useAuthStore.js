import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
const BASE_URL = "http://localhost:5001"
export const useAuthStore = create((set,get) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,
    onlineUsers: [],
    socket:null,

    checkAuth: async () => {
        try {
            const res = await axiosInstance.get("/auth/check");
            set({ authUser: res.data });
            get().connectSocket();

        } catch (error) {
            console.error("Error in checkAuth:", error);
            set({ authUser: null });
        } finally {
            set({ isCheckingAuth: false });
        }
    },

    signup: async (data) => {
        set({ isSigningUp: true });
        try {
            const res = await axiosInstance.post("/auth/signup", data);
            set({ authUser: res.data });
            toast.success("Account created successfully");

            get().connectSocket();

        } catch (error) {
            toast.error(error?.response?.data?.message);
        } finally {
            set({ isSigningUp: false });
        }
    },

    login: async (data)=>{
        set({isLoggingIn:true});
        try {
            const res = await axiosInstance.post("/auth/login",data);
            set({authUser: res.data});
            toast.success("Logged in Successfully")

            get().connectSocket();
        } catch (error) {
            toast.error(error?.response?.data?.message);
        }finally{
            set({isLoggingIn:false})
        }
    },

    logout: async (data) => {
        try {
            axiosInstance.post("/auth/logout");
            set({authUser : null});
            toast.success("Logged Out Successfully");

            get().disconnectSocket();
        } catch (error) {
            toast.error(error?.response?.data?.message || "Something went wrong");
        } finally{

        }
    },

    updateProfile: async (data) => {
        set({ isUpdatingProfile: true });
        try {
            const res = await axiosInstance.put("/auth/update-profile", data); // Await the request
            console.log("checking res.data in updateProfile",res.data)
            set({ authUser: res.data });
            toast.success("Profile updated successfully");
        } catch (error) {
            console.log("Error updating profile:", error);
            toast.error(error.response?.data?.message || "Failed to update profile");
        } finally {
            set({ isUpdatingProfile: false });
        }
    },
    connectSocket: ()=>{
        const {authUser} = get();
        if(!authUser || get().socket?.connected) return;

        const socket = io(BASE_URL);
        socket.connect();
        set({ socket });
    },
    disconnectSocket: ()=>{
        if(get().socket?.connected) get().socket.disconnect();
    },


}));
