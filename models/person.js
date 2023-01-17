const mongoose = require('mongoose')
const url = process.env.MONGODB_URI

const connectDB = async () => {
    console.log("connecting to", url)
    mongoose.connect(url)
        .then((result) => console.log("connected to MongoDB"))
        .catch((error) => {
            console.error("error connecting to MongoDB:", error.message)
            process.exit(1)
        })
}

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
})

personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports.Person = mongoose.model('Person', personSchema)
module.exports.connectDB = connectDB
