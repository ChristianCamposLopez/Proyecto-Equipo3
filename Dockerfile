# Dockerfile
FROM node:20-alpine

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos los archivos de dependencias e instalamos
COPY package*.json ./
RUN npm install

# Copiamos el resto del código (las vistas, controladores, modelos)
COPY . .

# Construimos la aplicación de Next.js (Solo para producción)
# RUN npm run build

# Aseguramos permisos básicos de forma rápida
RUN chmod 777 /app

# Exponemos el puerto donde correrá el sistema
EXPOSE 3000

# Comando para iniciar la aplicación en modo desarrollo
CMD ["npm", "run", "dev"]
