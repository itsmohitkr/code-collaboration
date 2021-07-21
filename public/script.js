const socket = io('/');

let name
do {
    name = prompt('enter your name.')
} while (!name)

const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');

myVideo.muted = true;


var peer = new Peer(undefined, {
    path: "/peerjs",
    host: "/",
    port: "443"
});


let myVideoStream
navigator.mediaDevices.getUserMedia({ // getUserMedia return a promise
    video: true,
    audio:true
}).then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);
    
    peer.on("call", (call) => {
        call.answer(stream);
        const video = document.createElement("video");
        call.on("stream", (userVideoStream) => {
            addVideoStream(video, userVideoStream);
        });
    });
    
    socket.on('user-connected', (userId) => {
        // console.log("new user connected");
        setTimeout(connectToNewUser, 1000, userId, stream)
        
        // connectToNewUser(userId, stream);
    })

    socket.on("notification", notification => {
        console.log(notification);

        appendNotification(notification);
    })
})
function appendNotification(Notification) {
     let Div= document.createElement('div');
     let className = "notification";
     Div.classList.add(className);
     let format = `
        <p>${Notification}</p>
    `
    Div.innerHTML = format;
    messageArea.appendChild(Div);
}
socket.on('user-disconnected', userId => {
    if (peer[userId]) peer[userId].close()
})

peer.on('open', (id) => {
    // console.log(id);
    socket.emit('join-room', ROOM_ID, id);
    
});

const connectToNewUser = (userId, stream) => {
    // console.log(userId);
    const call = peer.call(userId, stream);
    const video = document.createElement('video')
    
    call.on('stream', (userVideoStream)=>{
        addVideoStream(video,userVideoStream)
    })
     call.on('close', () => {
         video.remove()
     })
     peer[userId] = call
}

const addVideoStream = (video, stream) => {
    // console.log("line 55")
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
        videoGrid.append(video);
    });
}

// chat section

let textarea = document.querySelector("#textarea")
let messageArea = document.querySelector(".message_area")

let client_name = document.getElementById('name');
client_name.innerHTML = name;

textarea.addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
        sendMessage(e.target.value);
    }
})

function sendMessage(message) {
    let msg = {
        user: name,
        message: message.trim()
    }
    
    // append
    appendMessage(msg, 'outgoing')
    
    textarea.value = ''
    scrollToBottom();
    // send to server
    socket.emit('message', msg)
    

}

function appendMessage(msg, type) {
    let mainDiv = document.createElement('div');
    let className = type;
    mainDiv.classList.add(className, 'message');
    let markup = `
        <h4>${msg.user}</h4>
        <p>${msg.message}</p>
    `
    mainDiv.innerHTML = markup
    messageArea.appendChild(mainDiv)
}

// receive message

socket.on('message', (msg) => {
    appendMessage(msg, "incoming")
    scrollToBottom()
})

// auto scroll

function scrollToBottom() {
    messageArea.scrollTop = messageArea.scrollHeight
}


// text area

let editor_textArea = document.getElementById('editor_textArea');


editor_textArea.addEventListener('keyup', (e) => {
    const text = editor_textArea.value
    socket.emit("text_data",text);
})

socket.on('text_data', (text) => {
    editor_textArea.value= text
})


// muteunmute

const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        setUnmuteButton();
    } else {
        setMuteButton();
        myVideoStream.getAudioTracks()[0].enabled = true;
    }
}

const setMuteButton = () => {
    const html = `
    <i class="fas fa-microphone fa-2x"></i>
    `
    document.querySelector('.main__mute_button').innerHTML = html;
}

const setUnmuteButton = () => {
    const html = `
    <i class="unmute fas fa-microphone-slash fa-2x"></i>
    `
    document.querySelector('.main__mute_button').innerHTML = html;
}

const playStop = () => {
    console.log('object')
    let enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        setPlayVideo()
    } else {
        setStopVideo()
        myVideoStream.getVideoTracks()[0].enabled = true;
    }
}

const setStopVideo = () => {
    const html = `
    <i class="fas fa-video fa-2x"></i>
    `
    document.querySelector('.main__video_button').innerHTML = html;
}

const setPlayVideo = () => {
    const html = `
  <i class="stop fas fa-video-slash fa-2x"></i>
  `
    document.querySelector('.main__video_button').innerHTML = html;
}



// connect user

const connectUser = () => {
    prompt("📢share this link with your friend👨‍💼 to join 👏.", window.location.href)
}