const { PubSub } = require('@google-cloud/pubsub');
const pubSubClient = new PubSub();
const logger = require('../config/logger.js');

const publishMessage = async (topicName, data, verificationToken) => {
    data.verificationToken = verificationToken;
    const dataBuffer = Buffer.from(JSON.stringify(data));
    console.log(`Publishing message to topic ${topicName}`)
    try {
        const messageId = await pubSubClient.topic(topicName).publishMessage({data: dataBuffer, attributes: {verificationToken: verificationToken}});
        console.log(`Message ${messageId} published.`);
        logger.info(`Message ${messageId} published.`);
        return true;
    } catch (error) {
        console.error(`Received error while publishing: ${error.message}`);
        logger.error(`Received error while publishing`, {error: error.message});
        return false;
    }
};

const checkTopicExists = async (topicName) => {
    const topic = pubSubClient.topic(topicName);
    const [topicExists] = await topic.exists();
    return topicExists;
}

module.exports = [publishMessage, checkTopicExists];
