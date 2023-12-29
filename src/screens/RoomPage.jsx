import React, { useCallback, useEffect, useState } from 'react'
import { useSocket } from '../context/SocketProvider';
import ReactPlayer from 'react-player';
import peer from '../service/peer'

export const RoomPage = () => {
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();

  const handleUserJoined = useCallback(({ email, id }) => {
    console.log(`Email ${email} joined room `);
    setRemoteSocketId(id);
  }, []);

  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    const offer = await peer.getOffer();
    socket.emit('user:call', { to: remoteSocketId, offer });
    setMyStream(stream);
  }, [remoteSocketId, socket]);

  const handleIncommingCall = useCallback(async ({ from, offer }) => {
    setRemoteSocketId(from);
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    setMyStream(stream);

    // console.log("incommig call ", from, offer);
    const ans = await peer.getAnswer(offer);
    socket.emit('call:accepted', { to: from, ans });
  }, []);

  const sendStreams = useCallback(() => {
    if (myStream) {
      for (const track of myStream.getTracks()) {
        peer.peer.addTrack(track, myStream);
      }
    } else {
      console.error("myStream is null or undefined");
    }
  }, [myStream]);


  const handleCallAccepted = useCallback(async ({ from, ans }) => {
    await peer.setLocalDescription(ans);
    console.log("call accepted");
    sendStreams();
  }, [sendStreams]);


  const handleNegoNeedIncomming = useCallback(async ({ from, offer }) => {
    const ans = await peer.getAnswer(offer);
    socket.emit('peer:nego:done', { to: from, ans });
  }, [socket]);


  const handleNegoNeedFinal = useCallback(async ({ ans }) => {
    await peer.setLocalDescription(ans);
  }, []);

  useEffect(() => {
    peer.peer.addEventListener('track', async (ev) => {
      const remoteStream = ev.streams;
      setRemoteStream(remoteStream[0]);
    })
  }, []);

  //handle backend requests 

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on('incomming:call', handleIncommingCall);
    socket.on('call:accepted', handleCallAccepted);
    socket.on('peer:nego:needed', handleNegoNeedIncomming);
    socket.on('peer:nego:final', handleNegoNeedFinal);


    return () => {
      socket.off('user:joined', handleUserJoined);
      socket.off('incomming:call', handleIncommingCall);
      socket.off('call:accepted', handleCallAccepted);
      socket.off('peer:nego:needed', handleNegoNeedIncomming);
      socket.off('peer:nego:final', handleNegoNeedFinal);
    }

  }, [socket, handleUserJoined, handleCallAccepted, handleNegoNeedIncomming, handleNegoNeedFinal]);


  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit('peer:nego:needed', { offer, to: remoteSocketId });
  });

  useEffect(() => {
    peer.peer.addEventListener('negotiationneeded', handleNegoNeeded);

    return () => {
      peer.peer.removeEventListener('negotiationneeded', handleNegoNeeded);
    }
  }, [handleNegoNeeded]);



  return (
    <div>
      <h1>Room Page </h1>
      <div>
        <h4> {remoteSocketId ? 'Connected' : "No one in room "}</h4>
        {myStream && <button onClick={sendStreams} >Send Stream</button>}
        {remoteSocketId && (
          <button onClick={handleCallUser}>
            Call
          </button>
        )}
        {myStream && (
          <>
            <h1>My stream</h1>
            <ReactPlayer url={myStream} height='300px' width='200px' playing  />
          </>
        )}

        {remoteStream && (
          <>
            <h1>Remote stream</h1>
            <ReactPlayer url={remoteStream} height='300px' width='200px' playing muted />
          </>
        )}

      </div>
    </div>
  )
}
