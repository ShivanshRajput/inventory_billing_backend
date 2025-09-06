const express = require('express');
const router = express.Router();

router.get('/helloworld' , (req,res)=>{
    return res.status(200).json({
        msg:'hello from the other side of the world!!!'
    })
})

module.exports = router;