# Build step #1: build the React front end
FROM node:16-alpine AS build-step
WORKDIR /app
ENV PATH=/app/node_modules/.bin:$PATH
COPY client_app /app/client_app
WORKDIR /app/client_app
RUN npm install
RUN npm run build

# Build step #2: build the API with the client as static files
FROM python:3.9
WORKDIR /app
COPY --from=build-step /app/client_app/build ./build

COPY server /app/server
ENV PYTHONPATH=/app/server:$PYTHONPATH
RUN pip install -r ./server/requirements.txt
RUN pip install gunicorn
ENV FLASK_ENV=pre-production
ENV FLASK_CONFIG=development

EXPOSE 5000
WORKDIR /app/server
#CMD ["gunicorn", "-b", "0.0.0.0:5000", "wsgi:app"]
CMD ["flask", "run", "--debug", "-h", "0.0.0.0", "-p", "5000"]