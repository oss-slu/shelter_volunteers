FROM node:18-alpine AS base
ENV SERVER_URL=""
WORKDIR /app

FROM base AS dependencies
COPY ./package.json ./package-lock.json ./
RUN npm install --frozen-lockfile

FROM dependencies AS builder
COPY . .
RUN npm run build

FROM dependencies AS development
RUN npm install --frozen-lockfile
COPY . .
EXPOSE 3000
VOLUME [ "/app/client_app" ]
CMD ["npm", "run", "start"]

FROM nginxinc/nginx-unprivileged:alpine3.22-perl AS production
USER nginx
COPY --chown=nginx:nginx --from=builder /app/build /usr/share/nginx/html
COPY --chown=nginx:nginx ./nginx.conf.template /etc/nginx/nginx.conf.template
COPY --chown=nginx:nginx ./production-entrypoint.sh /production-entrypoint.sh
EXPOSE 8080
ENTRYPOINT [ "sh", "/production-entrypoint.sh" ]
CMD ["nginx", "-g", "daemon off;"]