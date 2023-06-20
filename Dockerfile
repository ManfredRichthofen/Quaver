FROM node:17.9.1-alpine
WORKDIR /usr/src/app
COPY . .
COPY settings.example.json /config/settings.json
RUN npm ci
RUN npm run build
RUN npm run slash-deploy
RUN npm run start
CMD [ "node", "index.js" ]
