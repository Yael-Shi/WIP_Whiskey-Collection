FROM node:18-alpine AS builder
WORKDIR /app

RUN apk add --no-cache bash

COPY package.json package-lock.json ./

RUN npm install

COPY . .

RUN chmod +x ./shadcn-setup.sh && ./shadcn-setup.sh

RUN npm install

RUN npm run build

FROM nginx:stable-alpine
WORKDIR /usr/share/nginx/html

RUN rm -rf ./*

COPY --from=builder /app/dist .

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]