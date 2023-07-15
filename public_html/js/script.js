/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/javascript.js to edit this template
 */

function changeStart() {
    var input = document.getElementById("startDate");
    input.type = "date";
    input.style.backgroundColor = "white";
}

function changeEnd() {
    var input = document.getElementById("endDate");
    input.type = "date";
    input.style.backgroundColor = "white";
}

function sendDate() {
    /*
     * send data function
     */
}


/**script for chat */
const chatMessagesContainer = document.getElementById('chatMessages');
        const messageInput = document.getElementById('messageInput');
        const sendMessageButton = document.getElementById('sendMessageButton');

        function addMessage(content, sender) {
            const messageContainer = document.createElement('li');
            messageContainer.classList.add('chat-message');
            if (sender) {
                messageContainer.classList.add('sender-message');
            } else {
                messageContainer.classList.add('receiver-message');
            }
            const messageContent = document.createElement('div');
            messageContent.classList.add('message-content');
            if (sender) {
                messageContent.classList.add('sender-content');
            } else {
                messageContent.classList.add('receiver-content');
            }

            messageContent.textContent = content;

            messageContainer.appendChild(messageContent);
            chatMessagesContainer.appendChild(messageContainer);
        }
//automatic answer to check if the code is working, later will be changed for a real chat interaction
        sendMessageButton.addEventListener('click', function () {
            const message = messageInput.value.trim();

            if (message !== '') {
                addMessage(message, true);
                setTimeout(function () {
                    addMessage('Example of response', false);
                }, 1000);

                messageInput.value = '';
            }
        });