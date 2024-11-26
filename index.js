require('dotenv').config()

const express = require('express')
const app = express()
app.use(express.json());
PORT = process.env.PORT
const connectToDatabase = require('./db'); 
 connectToDatabase();




const userRoute = require('./routes/user.routes');
const candidateRoute = require('./routes/candidate.routes');



app.use('/user',userRoute);
app.use('/candidate',candidateRoute);

app.get('/', (req, res) => {
  res.send('Hello World!')
})


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
})