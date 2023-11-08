FROM node:18-alpine
EXPOSE 3000
WORKDIR /app
RUN apk update && apk upgrade && apk add bash vim --no-cache
COPY ./src/ .
RUN npm install

ENTRYPOINT [ "npm", "run", "start"]
