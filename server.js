import http from 'http';
import app from '../app';

const port = process.env.PORT || 8000;
const server = http.createServer(app);

server.listen(port, () => {
    console.log("Server is Running on port: ", port);
});