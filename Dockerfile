FROM node:18
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
RUN npm run createDbUnix
CMD ["npm", "start"]