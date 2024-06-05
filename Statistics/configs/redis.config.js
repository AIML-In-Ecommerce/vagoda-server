import dotenv from 'dotenv'

import { createClient } from 'redis'

dotenv.config()

const redisClient = createClient(
    {
        host: "localhost",
        port: process.env.REDIS_PORT,
        // password: process.env.REDIS_PASSWORD,
    }
)


redisClient.on('connect', () => {
    console.log('Connected to Redis, port: ' + process.env.REDIS_PORT);
});

redisClient.on('error', (err) => {
    console.error('Redis error:', err);
});

async function connect()
{
    await redisClient.connect()
    await redisClient.set("welcome", "welcome to redis")
    const welcomeMessage = await redisClient.get("welcome")
    console.log(welcomeMessage)
}

// await connect()

export default redisClient