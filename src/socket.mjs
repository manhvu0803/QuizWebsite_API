import * as db from "./database/userDatabase.mjs";

export function setupSocket(socketIo) {
    socketIo.on("connection", setupClient);
    console.log("Socket is set up");
}

function setupClient(socket) {
    socket.on("subscribe", async (username) => {
        let groups = await db.getGroupsUserIn(username);
        for (let group in groups) {
            socket.join(`group_${group.id}`);
        }
        
        console.log(`User ${username} subscribed`);
    });
}