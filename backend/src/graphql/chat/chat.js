const {ChatTC} = require("../../models/chat/chat")
const requireAuthentication = require("../../middleware/jwt/requireAuthentication")
const {Chat} = require("../../models/chat/chat")
const {User} = require("../../models/user/user")

//***************
//*** QUERIES ***
//***************

ChatTC.addResolver({
    kind: "query",
    name: "getChat",
    description: "Show the chat a user is participating in",
    args: {
        chatID: "MongoID!",
        page: "Int"
    },
    type: ChatTC,
    resolve: async ({args, context}) => {
        const userSelf = await User.findOne({_id: context.req.user._id})

        const chatIDs = userSelf.friends.map(item => item.chat._id)
        if (!chatIDs.includes(args.chatID)) throw new Error("chatID does not exist or you are not participant of that chat")

        // if args.page is not defined, only show last message of chat, else, show pages of 20 entries
        const slice = (!args.page || args.page <= 0) ? 1 : [20 * (args.page - 1), 20]
        return Chat
            .findOne({_id: args.chatID})
            .slice("messages", slice)
    }
})

//*****************
//*** MUTATIONS ***
//*****************

ChatTC.addResolver({
    kind: "mutation",
    name: "sendMessage",
    description: "Write a message to a chat the user is participating in.",
    args: {
        chatID: "MongoID!",
        content: "String!",
    },
    type: "String!",
    resolve: async ({args, context}) => {
        const userSelf = await User.findOne({_id: context.req.user._id})

        const chatIDs = userSelf.friends.map(item => item.chat._id)
        if (!chatIDs.includes(args.chatID)) throw new Error("chatID does not exist or you are not participant of that chat")

        const chat = await Chat.findOne({_id: args.chatID})
        //new messages always on top
        chat.messages.unshift({content: args.content, author: userSelf._id})
        //limit to 1000 messages
        chat.messages = chat.messages.slice(0, 1000)
        await chat.save()

        return "Message sent successfully!"
    }
})

ChatTC.addResolver({
    kind: "mutation",
    name: "editOrDeleteMessage",
    description: "Delete a message of the current user",
    args: {
        chatID: "MongoID!",
        messageID: "MongoID!",
        content: "String",
    },
    type: "String!",
    resolve: async ({args, context}) => {
        const userSelf = await User.findOne({_id: context.req.user._id})

        const chatIDs = userSelf.friends.map(item => item.chat._id)
        if (!chatIDs.includes(args.chatID)) throw new Error("chatID does not exist or you are not participant of that chat")

        const chat = await Chat.findOne({_id: args.chatID})

        const messageToEditOrDelete = chat.messages.find(message => message._id.toString() === args.messageID)

        if (!messageToEditOrDelete.author.equals(userSelf._id)) throw new Error("You can only edit or delete your own messages")

        if (!args.content) {
            //delete
            chat.messages = chat.messages.filter(message => message !== messageToEditOrDelete)
            await chat.save()
            return "Message deleted successfully."
        } else {
            //replace
            const index = chat.messages.indexOf(messageToEditOrDelete)
            chat.messages[index].content = args.content
            await chat.save()
            return "Message edited successfully."
        }
    }
})

//***************
//*** EXPORTS ***
//***************

const ChatQuery = {
    ...requireAuthentication({
        getChat: ChatTC.getResolver("getChat"),
    }),
}

const ChatMutation = {
    ...requireAuthentication({
        sendMessage: ChatTC.getResolver("sendMessage"),
        editOrDeleteMessage: ChatTC.getResolver("editOrDeleteMessage"),
    }),
}

module.exports = {
    ChatQuery,
    ChatMutation
}