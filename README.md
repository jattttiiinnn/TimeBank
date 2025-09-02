# TimeBank App

A time banking application built with React, Node.js, Express, and MongoDB.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [MongoDB Atlas](https://cloud.mongodb.com/) (free cloud database)

## Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd project
   ```

2. **Set up environment variables**
   - Copy `.env.example` to `.env`
   - Update the values in `.env` as needed

3. **Set up MongoDB**
   - Create a free account at [MongoDB Atlas](https://cloud.mongodb.com/)
   - Create a new project and database cluster
   - Create a database user with read/write access
   - Get your connection string (it will look like `mongodb+srv://<username>:<password>@<cluster>.mongodb.net/`)
   - Add your database name to the connection string (e.g., `...mongodb.net/timebank`)

4. **Configure Environment**
   - Copy `.env.example` to `.env`
   - Update `MONGODB_URI` with your Atlas connection string

5. **Install dependencies**
   ```bash
   npm install
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```
   - Frontend will be available at `http://localhost:5173`
   - Backend API will be available at `http://localhost:3001`

## Available Scripts

- `npm run dev` - Start the development server
- `npm run dev:server` - Start the backend server with nodemon
- `npm run build` - Build for production
- `npm run test` - Run tests

## Database

- Using MongoDB Atlas (cloud database)
- No local installation required
- Data is stored securely in the cloud

## Contributing

1. Create a new branch
2. Make your changes
3. Submit a pull request

## License

MIT
