import Pusher from "pusher";
import pusherJs from "pusher-js";

export const serverPusher = new Pusher({
  appId: process.env.PUSHER_APPID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: "eu",
});
export const clientPusher = new pusherJs("273a56bd155ad4143e05", {
  cluster: "eu",
});
