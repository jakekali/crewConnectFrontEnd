// Imports

import React, {useState, useEffect} from 'react';
import Login from './Login';
import ChatList from './ChatList';
import Chat from './Chat';
import NewChat from './NewChat';

// External variable declarations

let newChatId = 3; // ID used for new chats

// Static Data for testing

// let test_chats = [
//     {
//         id: 1,
//         users: ["User 1", "User 2"],
//         name: 'Group Chat 1',
//         messages: [
//             { sender: 'User 1', text: 'Hello' },
//             { sender: 'User 2', text: 'Hi there' },
//         ],
//     },
//     {
//         id: 2,
//         users: ["User 1", "User 2"],
//         name: 'Group Chat 2',
//         messages: [
//             { sender: 'User 1', text: 'Hey' },
//             { sender: 'User 2', text: 'What\'s up?' },
//         ],
//     },
// ];

// Main application

const App = () => {

    // Variable Declarations
    const [loggedIn, setLoggedIn] = useState(false); // Boolean for logging in
    const [selectedChatId, setSelectedChatId] = useState(null); // Integer for chat selection
    const [chats, setChats] = useState([]); // List of chats    
    const [inputUsername, setInputUsername] = useState("");
    const [inputPassword, setInputPassword] = useState("");
    const [id, setId] = useState(0); // Add this line to manage `id` using useState
    
    // First useEffect hook
    useEffect(() => {
        if (!inputUsername || !inputPassword) return;
    
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
            } else {
                setLoggedIn(true);
                setId(data["userId"]); // Update this line to use setId
                console.log(id);
            }
        });
    
    }, [inputUsername, inputPassword]);

    useEffect(() => {
        if (!loggedIn) return;
        console.log("got here 1");
        const fetchGroupChatUsers = async (groupChatId) => {
            console.log("got here 2");
            const response = await fetch(`http://142.93.251.255:8080/message/id/` + groupChatId, {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json"
                }
            });
            const data = await response.json();
            return data.map(user => user.username);
        };
    
        const fetchGroupChatMessages = async (groupChatId) => {
            const response = await fetch(`http://142.93.251.255:8080/message/groupID/` + groupChatId, {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json"
                }
            });
            const data = await response.json();
            return data.map(message => ({ sender: message.userId, text: message.message }));
        };
    
        const fetchGroupChats = async () => {
            console.log("got here 3");
            const response = await fetch(`http://142.93.251.255:8080/groupchats/id/` + id, {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json"
                }
            });
            const data = await response.json();
            const newChats = await Promise.all(data.map(async entry => {
                const users = await fetchGroupChatUsers(entry["groupChatId"]);
                const messages = await fetchGroupChatMessages(entry["groupChatId"]);
                return {
                    id: entry["groupChatId"],
                    users,
                    name: entry["groupName"],
                    messages,
                };
            }));
            setChats(newChats);
        };
    
        fetchGroupChats();
    }, [loggedIn, id]);

    // Showing the login page

    if (!loggedIn) {
        return <Login onLogin={(username, password) => {
            setInputUsername(username);
            setInputPassword(password);
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

    const handleCreateChat = async (users, name) => {
        const currentDate = Math.floor(Date.now() / 1000);
        console.log(users);
        try {
          // Create the new group chat
          const response = await fetch(`http://142.93.251.255:8080/groupchat/newGroupName/` + name + "/size/" + users.length + "/date/" + currentDate.toString(), {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
          }).catch(error => console.error("Error in creating group chat fetch:", error));
          
          const data = await response.json();
          const groupChatId = data["groupChatId"];
      
          // Add users to the group chat
          for (const user of users) {
            await fetch(`http://142.93.251.255:8080/groupchat/gcId1/` + groupChatId + "/userId1/" + user.userId, {
              method: 'PUT',
              headers: {
                "Content-Type": "application/json",
              },
            }).catch(error => console.error("Error in adding users fetch:", error));
          }
      
          const newChat = { id: groupChatId, users, name, messages: [] };
          setChats([...chats, newChat]);
          setSelectedChatId(groupChatId);
      
        } catch (error) {
          console.error("Error creating new chat:", error);
        }
      };
    
    const handleSendMessage = async (message) => {
    try {
        const messageToSend = {
            groupChatId: selectedChatId,
            userId: id,
            message: message,
            timeSent: Math.floor(Date.now() / 1000),
        };
        console.log(messageToSend);
    
        // Send the message to the server
        const response = await fetch("http://142.93.251.255:8080/message", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(messageToSend),
        });
    } catch (error) {
        console.error("Error sending message:", error);
        }   
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
                onSelect={chatId => handleSelectChat(chatId)}
            />
            <button onClick={handleLogout} className="bottom">Log Out</button>
        </div>
    );
  
};

export default App;
export {newChatId};