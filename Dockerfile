FROM node:18
WORKDIR /server
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
RUN npm run createDbUnix
CMD ["npm", "start"]