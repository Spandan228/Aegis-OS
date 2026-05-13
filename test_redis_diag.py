import asyncio
import redis.asyncio as redis

async def main():
    print("Connecting to Redis...")
    try:
        r = redis.from_url("redis://localhost:6379/0", decode_responses=True)
        pubsub = r.pubsub()
        print("Subscribing...")
        await pubsub.subscribe("telemetry:raw")
        print("Subscribed successfully!")
        await pubsub.unsubscribe("telemetry:raw")
        print("Unsubscribed successfully!")
        await r.aclose()
    except Exception as e:
        print(f"Error: {e}")

asyncio.run(main())
