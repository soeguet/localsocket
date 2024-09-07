FROM fedora:latest

RUN dnf update -y && dnf install -y \
    curl \
    && dnf clean all
RUN curl -sL https://rpm.nodesource.com/setup_20.x | bash -
RUN dnf install -y nodejs

RUN dnf install -y unzip
RUN npm install -g bun

COPY . .

RUN bun install --force
RUN bun install -g prisma
RUN bunx prisma generate

