FROM node:22

WORKDIR /app

COPY . .

WORKDIR /app/backend

RUN npm install

RUN npx prisma generate

EXPOSE 8000

CMD ["npm", "start"]