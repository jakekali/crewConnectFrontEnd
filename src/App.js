// Imports

import React, {useState, useEffect} from 'react';
import Login from './Login';
import ChatList from './ChatList';
import Chat from './Chat';
import NewChat from './NewChat';

// External variable declarations

let newChatId = 3; // ID used for new chats

// Static Data for testing

let test_chats = [
    {
        id: 1,
        users: ["User 1", "User 2"],
        name: 'Group Chat 1',
        messages: [
            { sender: 'User 1', text: 'Hello' },
            { sender: 'User 2', text: 'Hi there' },
        ],
    },
    {
        id: 2,
        users: ["User 1", "User 2"],
        name: 'Group Chat 2',
        messages: [
            { sender: 'User 1', text: 'Hey' },
            { sender: 'User 2', text: 'What\'s up?' },
        ],
    },
];

// Main application

const App = () => {

    // Variable Declarations

    const [loggedIn, setLoggedIn] = useState(false); // Boolean for logging in
    const [selectedChatId, setSelectedChatId] = useState(null); // Integer for chat selection
    const [chats, setChats] = useState(test_chats); // List of chats    
    const [inputUsername, setInputUsername] = useState("");
    const [inputPassword, setInputPassword] = useState("");
    let id = 0;

    useEffect(() => {
        let jsonData = {"username": inputUsername, "password": inputPassword};
        console.log(jsonData);

        fetch(`http://142.93.251.255:8080/user/login`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(jsonData)
        }).then(async response => {
            const data = await response.json();
            console.log(data);
            if (!response.ok) {
                const error = (data && data.message) || response.statusText;
                return console.error(error);
            }

            else {
                setLoggedIn(true);
                id = data["userId"];
                fetch(`http://142.93.251.255:8080/groupchats/id/`+id, {
                    method: 'GET',
                    headers: {
                        "Content-Type": "application/json"
                    }
                }).then(async response => {
                    const data = await response.json();
                    data.forEach(entry => 
                        setChats([...chats, { 
                            id: entry["groupChatId"], 
                            users: ["ugh"], 
                            name: entry["groupName"], 
                            messages: []}])
                    );
                });
            }
        });

    }, [inputUsername, inputPassword]);

    useEffect(() => {
        let name = chats[chats.length-1].name;
        fetch(`http://142.93.251.255:8080/groupchat/newGroupName/`+name+"/size/0/date/"+"um", {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
        });
        fetch(`http://142.93.251.255:8080/groupchat/`+name, {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json"
                },
        }).then(async response => {
            const data = await response.json();
            fetch(`http://142.93.251.255:8080/groupchat/gcId1/`+data["groupChatId"]+"/userId1/"+id, {
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json"
                },
            }); 
            data.forEach(entry => 
                // add each user to group chat.
                console.log("entry")
            );
        });
        
    }, [chats])
    

    // Showing the login page

    if (!loggedIn) {
        return <Login onLogin={(username, password) => {
            setInputUsername(username);
            setInputPassword(password);
            console.log(username);
            console.log(password);
        }} />;
    }

    // Handler for logging out

    const handleLogout = () => {
        setLoggedIn(false);
    };

    // Handler for clicking on a chat to view it

    const handleSelectChat = (chatId) => {
        setSelectedChatId(chatId);
    };

    // Handler for creating a new chat

    const handleCreateChat = (users, name) => {
        const newChat = { id: newChatId, users, name, messages: []};
        setChats([...chats, newChat]);
        setSelectedChatId(newChatId++);
    };

    
    const handleSendMessage = (chatId, message) => {
        const newChats = chats.map((chat) => {
            if (chat.id === chatId) {
                return {
                    ...chat,
                    messages: [...chat.messages, { sender: "You", text: message }]
                };
            }
            return chat;
        });
        setChats(newChats);
    };

    

    // Showing the selected chat

    if (selectedChatId) {
        const selectedChat = chats.find((chat) => chat.id === selectedChatId);
        return ( <Chat 
            chat={selectedChat} 
            setSelectedChatId={setSelectedChatId} 
            onSendMessage={handleSendMessage}
            />
        );
    }

    // Return main HTML for home page

    return (
        <div className='page'>
            <h1>CrewConnect</h1>
            <NewChat
                show={selectedChatId != null}
                onCreate={handleCreateChat}
            />
            <ChatList
                chats={chats}
                onSelect={handleSelectChat}
            />
            <button onClick={handleLogout} className="bottom">Log Out</button>
        </div>
    );
  
};

export default App;
export {newChatId};