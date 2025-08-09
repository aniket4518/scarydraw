import express from 'express'
 const app =express()
 app.use(express.json())

const port = process.env.port || 3000

app.get ("/",(req,res)=>{
    res.json({message:"the server is working"})
})

app.post ("/signup",(req,res)=>{

})
app.post("/signin",(req,res)=>{

})
app.post ("/room",(req,res)=>{
    const roomid =123
    res.json(`created room with roomid ${roomid}`)
})

app.listen(port , ()=>{
    console.log (`server is running on port ${port}`)
})