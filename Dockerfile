# Dockerfile
FROM node:20-alpine

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos los archivos de dependencias e instalamos
COPY package*.json ./
RUN npm install

# Copiamos el resto del código (las vistas, controladores, modelos)
COPY . .

# Construimos la aplicación de Next.js
RUN npm run build

# Exponemos el puerto donde correrá el sistema
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["npm", "start"]
