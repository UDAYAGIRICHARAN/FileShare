FROM node:16-alpine

# Set the working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy project files
COPY . .

# Build the React app
RUN npm run build

# Serve the React app with `serve`
RUN npm install -g serve
EXPOSE 3000

# Start the React app
CMD ["serve", "-s", "build", "-l", "3000"]
