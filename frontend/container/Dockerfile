FROM node:12.13.0-alpine as build 
WORKDIR /app
COPY package*.json ./

RUN npm install

COPY . .
RUN npm run build

FROM nginx 
EXPOSE 3000
COPY --from=build /app/build /usr/share/nginx/html
COPY ./nginx/pictures.web.conf /etc/nginx/conf.d/pictures.web.conf