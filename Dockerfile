# Stage 1: Build the Next.js application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package.json and package-lock.json (if it exists) to leverage Docker cache
# If you are using yarn, change this to yarn.lock
COPY package.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the Next.js application for production with conditional logic
RUN if [ -f "public/data/countries_data.json" ]; then \
        echo "Building without data generation (countries_data.json exists)" && \
        npm run build; \
    else \
        echo "Building with data generation (countries_data.json not found)" && \
        npm run build-with-data; \
    fi

# Stage 2: Run the Next.js application
FROM node:20-alpine AS runner

WORKDIR /app

# Set environment variables for production
ENV NODE_ENV production

# Copy only the necessary files from the builder stage
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# If you have an .env.local file with production variables, copy it.
# Be cautious with sensitive information in .env.local; consider setting them via environment variables in your hosting provider.
# COPY .env.local .env.local

EXPOSE 3000

# Command to start the Next.js application in production mode
CMD ["npm", "start"]