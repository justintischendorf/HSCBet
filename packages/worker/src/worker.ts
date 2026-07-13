import { QueueManager } from "../../queue/src/client";

const qm = new QueueManager({
  port: Number(process.env.REDIS_PORT),
  hostname: String(process.env.REDIS_HOST),
});

// Wir bauen zwei separate, unendliche Schleifen als Funktionen
async function startGamesLoop() {
  while (true) {
    await qm.consume("games", async (payload) => {
      console.log("Verarbeite Spiel:", payload.gameId);
      await qm.publish("live_updates:games", {
        event:
          payload.eventType === "game_updated"
            ? "GAME_UPDATED"
            : "GAME_DELETED",
        gameId: payload.gameId,
      });
    });
  }
}

async function startGroupsLoop() {
  while (true) {
    await qm.consume("groups", async (payload) => {
      console.log("Verarbeite Gruppe:", payload.groupId);
      await qm.publish("live_updates:groups", {
        event: "GROUP_INVITED",
        groupId: payload.groupId,
      });
    });
  }
}

// Hauptfunktion, die BEIDE Schleifen gleichzeitig startet
async function main() {
  console.log("[Worker] Starte alle Queue-Loops parallel...");

  // Promise.all startet beide Funktionen zeitgleich.
  // Da beide eine unendliche while-Schleife haben, läuft das endlos parallel.
  await Promise.all([startGamesLoop(), startGroupsLoop()]);
}

main();
