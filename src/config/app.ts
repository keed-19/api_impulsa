const application = {
    cors: {
        server: [
            {
                origin: "*", //servidor que deseas que consuma o (*) en caso que sea acceso libre
                credentials: true,
                "Access-Control-Allow-Methods": 'POST, GET, OPTIONS, DELETE'
            }
        ]
    }
}

export {application};