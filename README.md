# localsocket

websocket for personal use. utilizing bun as a websocket. written for wails/react/tailwindcss client ("localchat")[https://github.com/soeguet/localchat].

# Tech Stack
- bun
- typescript
- zod
- prisma
- postgres
- docker

# Setup
create a .env file with the following:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/express
```

# Run
```sh
docker compose up --build -d
```
afterwards run the (client)[https://github.com/soeguet/localchat] and connect to the server.
