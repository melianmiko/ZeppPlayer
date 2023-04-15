export type PlayerStateEntry = {
    type?: "number" | "select" | "string" | "boolean",
    notEditable?: boolean,
    groupIcon?: string,
    displayName?: string,
    options?: string[],
    value: any,
    maxLength: number,
    getString?: (t: PlayerStateEntry) => string,
    getProgress?: (t: PlayerStateEntry) => number,
    shift?: (t: PlayerStateEntry) => any,
    getBoolean?: (t: PlayerStateEntry) => boolean,
}

export type GroupedPlayerStates = {
    [id: string]: {
        [name: string]: PlayerStateEntry
    }
};
