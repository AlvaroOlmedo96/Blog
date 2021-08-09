import server from './app'
import './database';


const PORT =  process.env.PORT || 3100;
server.listen(PORT, () => {
    console.log("Server listen on port", PORT);
});

