import { QueueManager } from "../../queue/src/client";
import { PubSubManager } from "../../pub-sub/src/client";

const qm = new QueueManager({
  port: Number(process.env.REDIS_PORT),
  hostname: String(process.env.REDIS_HOST),
});

const pm = new PubSubManager({
  port: Number(process.env.REDIS_PORT),
  hostname: String(process.env.REDIS_HOST),
});

// Wir bauen separate, unendliche Schleifen als Funktionen
function startGamesLoop() {
  qm.consume({
    topic: "games",
    callback: async ({ payload }) => {
      console.log("Verarbeite Spiel:", payload.gameId);
      pm.publish({
        chanelName: "broadcast",
        payload,
      });
    },
  });
}

function startGroupsLoop() {
  qm.consume({
    topic: "groups",
    callback: async ({ payload }) => {
      console.log("Verarbeite Gruppe:", payload.groupId);
      pm.publish({
        chanelName: `user:${payload.targetId}`,
        payload,
      });
    },
  });
}

function startSeasonsLoop() {
  qm.consume({
    topic: "seasons",
    callback: async ({ payload }) => {
      console.log("Verarbeite Season-Update");
      pm.publish({
        chanelName: "broadcast",
        payload,
      });
    },
  });
}

// Hauptfunktion, die alle Schleifen gleichzeitig startet
async function main() {
  console.log("[Worker] Starte alle Queue-Loops parallel...");

  // Promise.all startet alle Funktionen zeitgleich.
  // Da alle eine unendliche while-Schleife haben, läuft das endlos parallel.
  await Promise.all([startGamesLoop(), startGroupsLoop(), startSeasonsLoop()]);
}

main();
