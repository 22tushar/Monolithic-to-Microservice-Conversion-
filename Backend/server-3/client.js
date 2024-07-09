const { Kafka } = require("kafkajs");

exports.kafka = new Kafka({
    clientId: 'kafka-service',
    brokers: ['192.168.206.231:9092']
});

