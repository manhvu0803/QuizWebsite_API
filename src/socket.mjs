import * as db from "./database/userDatabase.mjs";

export function setupSocket(socketIo) {
    socketIo.on("subscribe", async (username) => {
        let groups = await db.getGroupsUserIn(username);
        for (let group in groups) {
            socketIo.join(`group_${group.id}`);
        }
    })
}