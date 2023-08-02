###################
# Development
###################
FROM node:18-alpine AS development
RUN apk update && apk add bash
WORKDIR /app

RUN npm i -g @nestjs/cli

## Build admin server
FROM node:18-alpine AS serverbuilder
WORKDIR /server
COPY package*.json yarn.lock ./
RUN yarn install
COPY . .
RUN yarn run build

## Serve api and admin
FROM node:18-alpine
RUN apk add --no-cache ffmpeg
WORKDIR /app
COPY --from=serverbuilder /server/.env .env
COPY --from=serverbuilder /server/node_modules ./node_modules
COPY --from=serverbuilder /server/dist ./dist

CMD [ "node", "dist/src/main" ]
