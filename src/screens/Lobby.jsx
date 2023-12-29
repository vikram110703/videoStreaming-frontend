import React, { useCallback, useEffect, useState} from 'react'
import { useSocket } from '../context/SocketProvider';
import {useNavigate } from 'react-router-dom';

export const Lobby = () => {
  const [email, setEmail] = useState('');
  const [room, setRoom] = useState('');
  const socket = useSocket();
  // console.log(socket);
  const navigate=useNavigate();

  const submitHandler = useCallback((e) => {
    e.preventDefault();
    socket.emit('room:join', { email, room });
    setRoom('');
    setEmail('');
  }, [email, room, socket]);

  const handleJoinRoom=useCallback((data)=>{
    const {email,room}=data;
    console.log(email,room);
    navigate(`/room/${room}`);
  },[navigate]);


  useEffect(() => {
    socket.on("room:join", handleJoinRoom);
    return()=>{
      socket.off('room:join',handleJoinRoom);
    }
  }, [socket,handleJoinRoom]);

  return (
    <div>
      <h1>Lobby</h1>
      <form onSubmit={submitHandler}>
        <label htmlFor='email' >Email ID</label>
        <input type='email' id='email' value={email} onChange={(e) => setEmail(e.target.value)} />
        <label htmlFor='room' >Room Number</label>
        <input type='text' id='room' value={room} onChange={(e) => setRoom(e.target.value
        )} />
        <br />
        <button type='submit' >Join</button>
      </form>

    </div>
  )
}
