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

// Wir bauen zwei separate, unendliche Schleifen als Funktionen
function startGamesLoop() {
  qm.consume({
    topic: "games",
    callback: async ({ job, payload }) => {
      console.log("Verarbeite Spiel:", payload.gameId);
      pm.publish({
        chanelName: `user:${job.data.userId}`,
        payload,
      });
    },
  });
}

function startGroupsLoop() {
  qm.consume({
    topic: "groups",
    callback: async ({ job, payload }) => {
      console.log("Verarbeite Gruppe:", payload.groupId);
      pm.publish({
        chanelName: `user:${job.data.userId}`,
        payload,
      });
    },
  });
}

// Hauptfunktion, die BEIDE Schleifen gleichzeitig startet
async function main() {
  console.log("[Worker] Starte alle Queue-Loops parallel...");

  // Promise.all startet beide Funktionen zeitgleich.
  // Da beide eine unendliche while-Schleife haben, läuft das endlos parallel.
  await Promise.all([startGamesLoop(), startGroupsLoop()]);
}

main();
