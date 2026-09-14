FROM node:22-alpine

# Define a pasta de trabalho dentro do container
WORKDIR /usr/src/app

# Copia os arquivos de dependência primeiro
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia o resto do código
COPY . .

# Expõe a porta que a API vai usar
EXPOSE 3000

# Inicia com o comando de desenvolvimento (que já chama o nodemon)
CMD ["npm", "run", "dev"]
