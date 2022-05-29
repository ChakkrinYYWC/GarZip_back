
const passport = require('passport'),
    express = require('express'),
    book = require('../models/book'),
    User = require('../models/user');
const mongoose = require("mongoose");
var router = express.Router();
require('dotenv').config()
const textToSpeech = require('@google-cloud/text-to-speech');
const fs = require('fs');
const util = require('util');
const client = new textToSpeech.TextToSpeechClient();
const cloudinary = require('./cloudinary');
const multer = require('multer');
const http = require('http')
const path = require('path');

const storage = multer.diskStorage({
    filename: (req, file, cb) => {
        const fileExt = file.originalname.split(".").pop();
        const filename = `${new Date().getTime()}.${fileExt}`;
        cb(null, filename);
    },
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === "audio/mp3" || file.mimetype === "audio/mpeg") {
        cb(null, true);
    } else {
        cb(
            {
                message: "Unsupported File Format",
            },
            false
        );
    }
};

const upload = multer({
    storage,
    limits: {
        fieldNameSize: 200,
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter,
}).single("audio");

router.post("/audio/upload/:id", async (req, res) => {
    // console.log('***')
    // console.log(req.params.id)
    // console.log(req.body)
    // console.log(req.file)
    upload(req, res, (err) => {
        if (err) {
            return res.send(err);
        }
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });
        const { path } = req.file;
        console.log('path')
        console.log(path)
        const fName = req.file.originalname.split(".")[0];
        console.log('fName')
        console.log(fName)
        cloudinary.uploader.upload(
            path,
            {
                resource_type: "raw",
                public_id: `AudioUploads/${fName}`,
            },
            (err, audio) => {
                if (err) return res.send(err);
                fs.unlinkSync(path);
                book.findByIdAndUpdate(req.params.id, { $set: { voice: audio.secure_url } }, async function (error, update) {
                    if (!error) {
                        //   console.log(update)
                        console.log('add audio book')
                        let found_book_id = await book.aggregate([
                            {
                                $match: {
                                    "_id": mongoose.Types.ObjectId(req.params.id)
                                }
                            },
                        ])
                        console.log(found_book_id[0].chapter)
                        res.render('pages/detail.ejs', { data: found_book_id, chapter: found_book_id[0].chapter });
                    } else {
                        console.log('Error #2 : ' + JSON.stringify(error, undefined, 2))
                    }
                })
                // res.send(audio.secure_url);
            }
        );
    })
})

router.post("/audio/upload/chapter/:id/:ep_id", async (req, res) => {
    // console.log('***')
    console.log(req.params.id)
    console.log(req.params.ep_id)
    // console.log(req.body)
    // console.log(req.file)
    upload(req, res, (err) => {
        if (err) {
            return res.send(err);
        }
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });
        const { path } = req.file;
        console.log('path')
        console.log(path)
        const fName = req.file.originalname.split(".")[0];
        console.log('fName')
        console.log(fName)
        cloudinary.uploader.upload(
            path,
            {
                resource_type: "raw",
                public_id: `AudioUploads/chapter/${fName}`,
            },
            async (err, audio) => {
                if (err) return res.send(err);
                fs.unlinkSync(path);

                let found_ep_id = await book.findByIdAndUpdate({
                    "_id": req.params.id,
                    "chapter": {
                        $elemMatch: {
                            _id: req.params.ep_id
                        }
                    }
                },
                    [
                        {
                            $set: {
                                "chapter": {
                                    $map: {
                                        input: "$chapter",
                                        as: "m",
                                        in: {
                                            $cond: [
                                                { $eq: ["$$m._id", req.params.ep_id] }, // condition
                                                { $mergeObjects: ["$$m", { voice: audio.secure_url }] }, // true
                                                "$$m" // false
                                            ]
                                        }
                                    }
                                }
                            }
                        }
                    ])
                console.log(found_ep_id)
                let found_book_id = await book.aggregate([
                    {
                        $match: {
                            "_id": mongoose.Types.ObjectId(req.params.id)
                        }
                    },
                ])
                console.log(found_book_id[0].chapter)
                res.render('pages/detail.ejs', { data: found_book_id, chapter: found_book_id[0].chapter });

                // book.findByIdAndUpdate(req.params.id, { $addToSet: { voice: audio.secure_url } }, async function (error, update) {
                //     if (!error) {
                //     //   console.log(update)
                //       console.log('add audio book')
                //       let found_book_id = await book.aggregate([
                //         {
                //           $match: {
                //             "_id": mongoose.Types.ObjectId(req.params.id)
                //           }
                //         },
                //       ])
                //       console.log(found_book_id[0].chapter)
                //       res.render('pages/detail.ejs', { data: found_book_id, chapter: found_book_id[0].chapter });
                //     } else {
                //       console.log('Error #2 : ' + JSON.stringify(error, undefined, 2))
                //     }
                //   })
                // res.send(audio.secure_url);
            }
        );
    })
})



// async function quickStart() {
//     console.log('****')
//     const text = "กาลครั้งหนึ่งนานมาแล้ว มีสามีภรรยาชาวสวนคู่หนึ่งครองรักกันมานาน ฝ่ายภรรยานั้นกำลังตั้งครรภ์ลูกคนแรก และแพ้ท้องอยากกินหัวผักกาด เธอเฝ้ามองแปลงผักกาดของบ้านข้าง ๆ ทุกวันจากหน้าต่างบ้านชั้น 2 แต่ไม่มีใครกล้าไปเอาผักกาดเหล่านั้น เพราะสวนที่ว่าเป็นของแม่มดใจร้าย";
//     const request = {
//         input: { text: text },
//         voice: { languageCode: 'th-TH', ssmlGender: 'NEUTRAL' },
//         audioConfig: { audioEncoding: 'MP3' },
//     };

//     const response = await client.synthesizeSpeech(request);
//     fs.writeFileSync(response.audioContent, data, { encoding: 'binary' });
//     // const writeFile = util.promisify(fs.writeFile);
//     // await writeFile('public/voice/1.mp3', response.audioContent, 'binary');
//     console.log(response.audioContent);
// }
// convertTextTpMp3()


router.post('/', async (req, res) => {
    const text = req.body.text
    outputFilePath = "public/voice/" + req.body.name + ".mp3"
    const request = {
        input: { text: text },
        voice: { languageCode: req.body.language, ssmlGender: 'NEUTRAL' },
        audioConfig: { audioEncoding: 'MP3', pitch: req.body.pitch, speakingRate: 0.85 },
    };
    console.log(request)
    const [response] = await client.synthesizeSpeech(request);
    const writeFile = util.promisify(fs.writeFile);
    // await writeFile('public/voice/2.mp3', response.audioContent, 'binary');
    await writeFile(outputFilePath, response.audioContent, 'binary');
    console.log(`Audio content written to file: ${outputFilePath}`);

    res.download(outputFilePath, async (err, res) => {
        if (err) {
            fs.unlinkSync(outputFilePath)
            res.send("Unable to download the file")
        }
        fs.unlinkSync(outputFilePath)
        console.log('build audio')
        // let found_book_id = await book.aggregate([
        //     {
        //         $match: {
        //             "_id": mongoose.Types.ObjectId(req.params.id)
        //         }
        //     },
        // ])
        // console.log(found_book_id[0].chapter)
        // res.render('pages/detail.ejs', { data: found_book_id, chapter: found_book_id[0].chapter });
    })





    // console.log(test)

    // fs.unlinkSync(outputFilePath)
    // const filePath = path.join(__dirname, '../', outputFilePath);

    // var test = fs.readFileSync(outputFilePath)
    // res.render('test.ejs', { 'fileaudio': res.sendFile(filePath)})
    // res.sendFile(filePath)
    // console.log(test)
    // res.redirect(307, '/tts/audio/upload', res.sendFile(filePath))
    // res.redirect(307, '/tts/audio/upload')
    // console.log(fs.readFileSync(outputFilePath, 'binary'))

    // var sound = new Audio (outputFilePath)
    // upload(req, res, (err) => {
    //     if (err) {
    //         return res.send(err);
    //     }
    //     cloudinary.config({
    //         cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    //         api_key: process.env.CLOUDINARY_API_KEY,
    //         api_secret: process.env.CLOUDINARY_API_SECRET,
    //     });
    //     const { path } = sound;
    //     console.log('path')
    //     console.log(path)
    //     const fName = sound.originalname.split(".")[0];
    //     console.log('fName')
    //     console.log(fName)
    //     cloudinary.uploader.upload(
    //         path,
    //         {
    //             resource_type: "raw",
    //             public_id: `AudioUploads/${fName}`,
    //         },
    //         (err, audio) => {
    //             if (err) return res.send(err);
    //             fs.unlinkSync(path);
    //             res.send(audio.secure_url);
    //         }
    //     );
    // })
    // upload(req, res, function (err) {
    //     if (err) {
    //         console.log(err);
    //     }
    //     res.json({
    //         success: true,
    //         message: 'Image uploaded!'
    //     });
    // })
    // var options = {
    //     root: path.join("/Users/tawan/Downloads/Project/garzip_back")
    // };
    // res.sendFile(outputFilePath, options )
    // cloudinary.config({
    //     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    //     api_key: process.env.CLOUDINARY_API_KEY,
    //     api_secret: process.env.CLOUDINARY_API_SECRET,
    // });
    // const { path } = req.file;
    // const fName = req.file.originalname.split(".")[0];
    // console.log('path')
    // console.log(path)
    // console.log('fName')
    // console.log(fName)
    // cloudinary.uploader.upload(
    //     path,
    //     {
    //         resource_type: "raw",
    //         public_id: `AudioUploads/${fName}`,
    //     },
    //     (err, audio) => {
    //         if (err) return res.send(err);
    //         fs.unlinkSync(path);
    //         res.send(audio.secure_url);
    //     }
    // );

    // res.redirect(307, '/tts/audio/upload');
    // fs.readFileSync(outputFilePath, (err, data)=>{
    //     console.log(data)
    // });
    // res.redirect('/audio/upload');
    // var stat = fs.statSync(outputFilePath);
    // res.sendFile(path.join(__dirname, '../'+outputFilePath));
    // console.log('*successfully built*');
    // var fileName = outputFilePath;
    // fs.readFileSync(outputFilePath, "book_voice", 'file', (err, files) => {
    //     if (err) {
    //         return console.log(err.message);
    //     }
    //     console.log(book_voice);
    // var returnData = {};
    // var stat = fs.statSync(outputFilePath);
    // var readStream = fs.createReadStream(outputFilePath);
    // const fileAsString = fs.readFileSync(outputFilePath)
    // fs.readFile(outputFilePath, function(err, file){
    //     // var base64File = new Buffer(file, 'binary').toString('base64');
    //     // returnData.fileContent = base64File;
    //     res.json((file, 'binary').toString('base64'));
    // });
    // var filevoice = res.download(outputFilePath)
    // console.log(filevoice)
    // res.send(filevoice)


    // fs.unlinkSync(outputFilePath)

    // fs.unlinkSync(outputFilePath)
})



module.exports = router;