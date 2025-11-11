FROM node:24.0.0-alpine
WORKDIR /SupplierDescAPI

COPY package.json ./
COPY package-lock.json ./
RUN npm install
COPY . .

EXPOSE 8080

CMD ["node", "./endpoints.js"]