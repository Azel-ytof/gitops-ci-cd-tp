# Image de CircuitCourt : simple, mais lourde.
# TODO TP 6 : une image légère en deux étapes (modèle sur la slide du TP), et un fichier .dockerignore
FROM node:24

WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
