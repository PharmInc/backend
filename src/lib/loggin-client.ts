import pino from "pino";

const logger = pino({
    formatters: {
        level: (label) => ({ level: label.toUpperCase() }),
        bindings: () => ({ service: "service-template" }),
    },
    serializers: {
        err: pino.stdSerializers.err,
    },
    timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
});

export default logger;
