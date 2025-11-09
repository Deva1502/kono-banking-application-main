"use client";
import Loader from "@/components/Loader";
import { axiosClient } from "@/utils/AxiosClient";
import { toast } from "react-toastify";

// const { createContext, useContext, useState, useEffect } = require("react");
import {createContext, useContext, useState, useEffect} from 'react'
import { useRouter } from "next/navigation";

const mainContext = createContext({user:{},fetchUserProfile(){},LogoutHandler(){},fetchATMDetails(){},atm:{}})

export const useMainContext = ()=> useContext(mainContext)

export const MainContextProvider = ({children})=>{

    const [user,setUser] = useState(null)
    const [loading,setLoading] = useState(true)
    const router = useRouter()

    const [atm,setAtm] = useState(null)
    // to fetch user profile 
    const fetchUserProfile = async () => {
  try {
    const token = localStorage.getItem("token") || "";
    if (!token) return;
    const response = await axiosClient.get("/auth/profile", {
      headers: { Authorization: "Bearer " + token },
    });
    const raw = await response.data;

    // Normalize arrays and numbers
    const accounts =
      Array.isArray(raw?.accounts)
        ? raw.accounts
        : Array.isArray(raw?.account_no)
        ? raw.account_no.map((a) => ({
            _id: a._id,
            amount: a.amount,
            ac_type: a.ac_type || raw?.ac_type,
          }))
        : [];

    const atms = Array.isArray(raw?.atms) ? raw.atms : [];
    const fd_amount = typeof raw?.fd_amount === "number" ? raw.fd_amount : 0;

    const normalized = {
      ...raw,
      accounts,
      account_no: accounts, // keep legacy accessor to avoid breaking pages
      atms,
      fd_amount,
    };

    setUser(normalized);
  } catch (error) {
    toast.error(error?.response?.data?.msg || error.message);
  } finally {
    setLoading(false);
  }
};



    const fetchATMDetails = async(id)=>{

        try {
        
            if(!id){
                return
            }
            const response = await axiosClient.get(`/atm/get/${id}`,{
                headers:{
                    'Authorization':'Bearer '+ localStorage.getItem("token")
                }
            })
            const data  = await response.data  
            setAtm(data)


        } catch (error) {
            console.log(error)
            toast.error(error.response.data.msg || error.message)
        } 
    }
    const LogoutHandler = () => {
  try {
    // optional: await axiosClient.post("/auth/logout"); // if you add such endpoint
  } finally {
    localStorage.removeItem("token");
    // Clear any axios default header you might set elsewhere
    // axiosClient.defaults.headers.common["Authorization"] = undefined;
    setUser(null);
    router.push("/login");
    toast.success("Logout Success");
  }
};



    useEffect(()=>{
        fetchUserProfile()
    },[])

    if(loading){
            return <div className="min-h-screen flex items-center justify-center w-full">
                <Loader/>
            </div>
    }

    return <mainContext.Provider value={{user,fetchUserProfile,LogoutHandler,fetchATMDetails,atm}}>
        {children}
    </mainContext.Provider>
}