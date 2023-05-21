export type AppModule = {
    watchface: {
        path: string
    },
    page: {
        pages: string[]
    }
}

export type ZeppAppJson = {
    app: {
        appId: number,
        appType: "app"|"watchface",
    },
    targets: {[id: string]: {
        module: AppModule
    }},

    runtime: {
        type: number
    },
    module: AppModule,
}
