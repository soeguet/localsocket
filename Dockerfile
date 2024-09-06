FROM ubuntu:20.04

RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*
RUN curl -sL https://deb.nodesource.com/setup_20.x | bash -
RUN apt-get install -y nodejs

RUN apt-get install unzip
RUN npm install -g bun

COPY . .

RUN bun install --force
RUN bun install -g prisma@5.18.0
