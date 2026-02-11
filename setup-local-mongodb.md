# Setup Local MongoDB for Development

## Option 1: Install MongoDB locally
```bash
# Windows
# Download and install MongoDB Community Server from: https://www.mongodb.com/try/download/community

# Start MongoDB service
net start MongoDB

# Or use MongoDB Compass (GUI)
```

## Option 2: Use Docker (Recommended)
```bash
# Install Docker
# Run MongoDB container
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or with docker-compose
echo 'version: "3.8"
services:
  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

volumes:
  mongodb_data:' > docker-compose.yml
docker-compose up -d
```

## Update .env for local MongoDB
```
MONGODB_URI="mongodb://localhost:27017/habit_tracker"
SESSION_SECRET="abcd"
```

## Benefits of Local MongoDB
✅ Faster development
✅ No network dependency
✅ Full control over data
✅ No connection timeouts
✅ Better for testing
