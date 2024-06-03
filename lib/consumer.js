const amqp = require('amqplib');

const { getDatabaseReference } = require('../lib/mongo');
const { connectToDb } = require('../lib/mongo');
const { ObjectId } = require('mongodb');
const { GridFSBucket } = require('mongodb');
const { Collection } = require('mongodb');
const rabbitmpHost = 'rabbitmq';
const rabbitmqUrl = `amqp://${rabbitmpHost}`;
const sharp = require('sharp');
const fs = require('fs');
const { connect } = require('http2');

async function main() {

    try {
        connectToDb(async () => {
            const connection = await amqp.connect(rabbitmqUrl);
            const channel = await connection.createChannel();
            const db = await getDatabaseReference();
            await channel.assertQueue('photos');
            channel.consume('photos', async (message) => {
                if (message) {
                    const fileCollection = db.collection('photos.files');
                    const bucket = new GridFSBucket(db, { bucketName: 'photos' });
                    const photoId = new ObjectId(message.content.toString());
                    const openDownloadStream = bucket.openDownloadStream(photoId);
                    const thumbStream = sharp().resize(100, 100).jpeg();
                    const thumbBucket = new GridFSBucket(db, { bucketName: 'thumbnails' });
                    const thumbId = new ObjectId();
                    const thumbMeta = {
                        contentType: 'image/jpeg',
                        metadata: {
                            original: photoId.toString()
                        }
                    };
                    const uploadStream = thumbBucket.openUploadStreamWithId(thumbId, `${photoId}.jpg`, thumbMeta);
                    openDownloadStream.pipe(thumbStream).pipe(uploadStream);

                    uploadStream.on('finish', async () => {
                        await fileCollection.updateOne({ _id: photoId }, { $set: { thumbnail: thumbId } });
                        channel.ack(message);
                
                    });
                }
            });
        }
        );
    }
    catch (err) {
        console.error(err);
        process.exit(1);
    }
}

main();
  