# Etapa 1: Dependencias y build
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar solo los archivos necesarios primero
COPY package*.json ./

RUN npm install --production

# Copiar el resto del código del backend
COPY . .


# Etapa 2: Imagen final para producción
FROM node:18-alpine

WORKDIR /app

# Copiar todo desde el build
COPY --from=builder /app /app

# Crear carpeta persistente para uploads (por si no existe)
RUN mkdir -p /app/assets/bombero

# Exponer el puerto de tu backend
EXPOSE 8020

# Comando para iniciar Express
CMD ["npm", "start"]
