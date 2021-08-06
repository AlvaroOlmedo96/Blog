import server from './app'
import './database';


const PORT =  process.env.PORT || 3000;
server.listen(PORT);

console.log("Server listen on port", PORT);