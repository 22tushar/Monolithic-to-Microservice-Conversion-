const { Kafka } = require("kafkajs");

exports.kafka = new Kafka({
    clientId: 'kafka-service',
    brokers: ['192.168.201.231:9092']
});

