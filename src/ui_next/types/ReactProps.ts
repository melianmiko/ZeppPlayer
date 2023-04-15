import ZeppPlayer from "../../zepp_player/ZeppPlayer";

export type PropsWithPlayer<P> = P & {
    player: ZeppPlayer
};
