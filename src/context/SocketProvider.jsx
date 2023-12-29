import React,{createContext, useContext, useMemo} from 'react';
import {io} from 'socket.io-client';

const SocketContext=createContext(null);

 
export const useSocket=()=>{
    const socket=useContext(SocketContext);
    return socket;
};

const SocketProvider = (props) => {
  // const backendServer='localhost:8000';
  const backendServer='https://videostreaming-backend.onrender.com';
    const socket=useMemo(()=>io(backendServer),[]);
  return (
    <SocketContext.Provider value={socket} >
        {props.children}
    </SocketContext.Provider>
  )
}

export default SocketProvider