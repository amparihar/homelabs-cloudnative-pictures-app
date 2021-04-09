FROM node:12.13.0-alpine
WORKDIR /app
COPY package*.json ./

RUN npm install

COPY . .
RUN npm run build

FROM nginx 
EXPOSE 3000
#COPY --from=0 /app/build /usr/share/nginx/html
COPY --from=0 /app/build /etc/nginx/html/www/pictures.web
COPY ./nginx/pictures.web.conf /etc/nginx/conf.d/pictures.web.conf